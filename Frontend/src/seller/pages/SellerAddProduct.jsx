import React, { useState, useRef, useEffect } from "react";
import SellerNavbar from "../components/SellerNavbar";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaArrowLeft, FaArrowRight, FaSpinner, FaRegImage, FaRegPlayCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const CATEGORY_LIST = [
  "fashion", "electronic", "furniture", "kitchen", "toys", "cosmetic", "food", "sports", "appliances"
];

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function SellerAddProduct() {
  const { seller, token, logout } = useSellerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", category: "", description: "", stock: "", price: "",
    images: [], videos: [], delivery: ""
  });

  const [imageMode, setImageMode] = useState("upload");
  const [videoMode, setVideoMode] = useState("upload");
  const [autoArrange, setAutoArrange] = useState(true);
  const [mediaOrder, setMediaOrder] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // drag refs for manual reorder
  const dragItem = useRef();
  const dragOverItem = useRef();

  const setField = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const uploadFile = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000
      });
      return res.data.url || res.data.secure_url || null;
    } catch (e) {
      toast.error("Upload failed. Try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (!url) return;
    if (type === "image") setField("images", [...form.images, url]);
    else setField("videos", [...form.videos, url]);
  };

  const addUrl = (type, url) => {
    if (!url) return;
    if (type === "image") setField("images", [...form.images, url]);
    else setField("videos", [...form.videos, url]);
  };

  // Auto merge
  const buildAutoMerged = () => {
    const imgs = [...form.images];
    const vids = [...form.videos];
    const merged = [];
    let i = 0, v = 0;
    let turn = imgs.length > 0 ? "image" : "video";
    while (i < imgs.length || v < vids.length) {
      if (turn === "image" && i < imgs.length) { merged.push({ type: "image", url: imgs[i++] }); }
      else if (turn === "video" && v < vids.length) { merged.push({ type: "video", url: vids[v++] }); }
      else {
        if (i < imgs.length) merged.push({ type: "image", url: imgs[i++] });
        else if (v < vids.length) merged.push({ type: "video", url: vids[v++] });
        else break;
      }
      turn = (turn === "image") ? "video" : "image";
    }
    return merged;
  };

  // Manual
  const buildManualMerged = () => [
    ...form.images.map(u => ({ type: "image", url: u })),
    ...form.videos.map(u => ({ type: "video", url: u }))
  ];

  useEffect(() => {
    if (autoArrange) setMediaOrder(buildAutoMerged());
    else {
      const prevUrls = new Set(mediaOrder.map(m => m.url));
      const current = buildManualMerged();
      const preserved = current.filter(m => prevUrls.has(m.url));
      const added = current.filter(m => !prevUrls.has(m.url));
      setMediaOrder([...preserved, ...added]);
    }
    // eslint-disable-next-line
  }, [form.images.length, form.videos.length, autoArrange]);

  // drag handlers
  const handleDragStart = (e, pos) => { dragItem.current = pos; };
  const handleDragEnter = (e, pos) => { dragOverItem.current = pos; };
  const handleDragEnd = (e) => {
    const list = [...mediaOrder];
    const dragged = list[dragItem.current];
    list.splice(dragItem.current, 1);
    list.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setMediaOrder(list);
  };

  const removeAt = (idx) => {
    const item = mediaOrder[idx];
    if (!item) return;
    if (item.type === "image") setField("images", form.images.filter(u => u !== item.url));
    else setField("videos", form.videos.filter(u => u !== item.url));
    if (autoArrange) setMediaOrder(buildAutoMerged());
    else setMediaOrder(prev => prev.filter((_, i) => i !== idx));
  };

  const moveItem = (idx, dir) => {
    const arr = [...mediaOrder];
    const target = dir === "left" ? idx - 1 : idx + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setMediaOrder(arr);
  };

  const finalMergedForSubmit = () => autoArrange ? buildAutoMerged() : mediaOrder;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!seller || !seller._id) throw new Error("Login required.");
      if (!form.name.trim()) throw new Error("Product name required.");
      if (!form.category) throw new Error("Category required.");
      if (!form.stock || Number(form.stock) <= 0) throw new Error("Stock must be positive.");
      if (!form.price || Number(form.price) <= 0) throw new Error("Price must be positive.");

      const merged = finalMergedForSubmit();

      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description,
        stock: Number(form.stock),
        price: Number(form.price),
        image: form.images[0] || (merged.find(m => m.type === "image")?.url || ""),
        images: form.images,
        videos: form.videos,
        delivery: form.delivery,
        sellerId: seller._id,
        mediaOrder: merged,
      };

      await axios.post(`${API_BASE}/api/sellers/products/with-stock`, payload,
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Product added!");
      setTimeout(() => navigate("/seller/products"), 700);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Submit failed.");
      if (err.response?.status === 401) logout();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SellerNavbar />
      <ToastContainer position="top-center" />
      <motion.div
        className="min-h-screen bg-gradient-to-br from-[#f6f5ff] to-[#edeaff] py-14 px-6"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 md:p-12 space-y-6">
            <motion.h2
              className="text-3xl font-black text-[#2a0055] mb-1 drop-shadow dark:text-[#18102f]"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}>
              Add New Product
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-7">
              {/* All Inputs */}
              <div className="md:col-span-2 space-y-4">
                <input className="w-full p-4 rounded-xl border-2 shadow focus:ring-2 focus:ring-[#2a0055] text-lg" placeholder="Product name" value={form.name} onChange={e => setField("name", e.target.value)} />
                <select className="w-full p-4 rounded-xl border-2 shadow" value={form.category} onChange={e => setField("category", e.target.value)}>
                  <option value="">-- Select Category --</option>
                  {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-4">
                  <input type="number" min="1" placeholder="Stock" className="p-4 rounded-xl border-2 shadow flex-1" value={form.stock} onChange={e => setField("stock", e.target.value)} />
                  <input type="number" min="1" placeholder="Price" className="p-4 rounded-xl border-2 shadow flex-1" value={form.price} onChange={e => setField("price", e.target.value)} />
                </div>
                <textarea placeholder="Short description" className="w-full p-4 rounded-xl border-2 shadow" rows={3} value={form.description} onChange={e => setField("description", e.target.value)} />
                <input placeholder="Delivery info" className="w-full p-4 rounded-xl border-2 shadow" value={form.delivery} onChange={e => setField("delivery", e.target.value)} />
              </div>

              {/* Media Uploads */}
              <div className="flex flex-col gap-6">
                <motion.div layout className="p-3 bg-[#fafaff] rounded-xl shadow-xl border-2 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#2a0055] text-lg">
                    <FaRegImage /> Images
                  </div>
                  <div className="flex justify-center my-2 rounded-xl">
                    <button type="button" className={`flex-1 px-4 py-2 font-bold rounded-l-xl border ${imageMode === "upload" ? "bg-[#2a0055] text-white" : "bg-white"}`} onClick={() => setImageMode("upload")}>Upload</button>
                    <button type="button" className={`flex-1 px-4 py-2 font-bold rounded-r-xl border ${imageMode === "url" ? "bg-[#2a0055] text-white" : "bg-white"}`} onClick={() => setImageMode("url")}>URL</button>
                  </div>
                  {imageMode === "upload" ? (
                    <input className="w-full my-2" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")}/>
                  ) : (
                    <div className="flex gap-2">
                      <input id="img-url" className="flex-1 p-2 rounded-lg border" placeholder="Paste image URL" />
                      <button type="button" className="px-3 py-1 bg-[#2a0055] text-white rounded-lg" onClick={()=>{
                        const el = document.getElementById("img-url");
                        if(el?.value){ addUrl("image", el.value.trim()); el.value=""; }
                      }}>Add</button>
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">
                    {form.images.length} selected {uploading && <FaSpinner className="inline animate-spin" />}
                  </div>
                </motion.div>

                <motion.div layout className="p-3 bg-[#fafaff] rounded-xl shadow-xl border-2 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#2a0055] text-lg">
                    <FaRegPlayCircle /> Videos
                  </div>
                  <div className="flex justify-center my-2 rounded-xl">
                    <button type="button" className={`flex-1 px-4 py-2 font-bold rounded-l-xl border ${videoMode === "upload" ? "bg-[#2a0055] text-white" : "bg-white"}`} onClick={() => setVideoMode("upload")}>Upload</button>
                    <button type="button" className={`flex-1 px-4 py-2 font-bold rounded-r-xl border ${videoMode === "url" ? "bg-[#2a0055] text-white" : "bg-white"}`} onClick={() => setVideoMode("url")}>URL</button>
                  </div>
                  {videoMode === "upload" ? (
                    <input className="w-full my-2" type="file" accept="video/*" onChange={(e) => handleFileChange(e, "video")}/>
                  ) : (
                    <div className="flex gap-2">
                      <input id="vid-url" className="flex-1 p-2 rounded-lg border" placeholder="Paste video URL" />
                      <button type="button" className="px-3 py-1 bg-[#2a0055] text-white rounded-lg" onClick={()=>{
                        const el = document.getElementById("vid-url");
                        if(el?.value){ addUrl("video", el.value.trim()); el.value=""; }
                      }}>Add</button>
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">
                    {form.videos.length} selected {uploading && <FaSpinner className="inline animate-spin" />}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Media Preview */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-xl">Media Preview & Order</h3>
                <div className="text-xs text-gray-500">Drag to reorder (Manual mode)</div>
              </div>
              <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {mediaOrder.length === 0 && (
                    <motion.div className="text-sm text-gray-400 col-span-full"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      No media yet
                    </motion.div>
                  )}
                  {mediaOrder.map((m, idx) => (
                    <motion.div
                      key={m.url + idx}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18 }}
                      draggable={!autoArrange}
                      onDragStart={e => !autoArrange && handleDragStart(e, idx)}
                      onDragEnter={e => !autoArrange && handleDragEnter(e, idx)}
                      onDragEnd={e => !autoArrange && handleDragEnd(e)}
                      className="relative border rounded-2xl overflow-hidden bg-white shadow-lg"
                    >
                      {m.type === "image" ? (
                        <motion.img src={m.url} alt="media"
                          whileHover={{ scale: 1.07 }} className="w-full h-24 md:h-32 lg:h-40 object-cover cursor-pointer" />
                      ) : (
                        <motion.video src={m.url} controls
                          whileHover={{ scale: 1.04 }} className="w-full h-24 md:h-32 lg:h-40 object-cover bg-black cursor-pointer" />
                      )}
                      <div className="p-2 flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-700">{m.type.toUpperCase()}</div>
                        <div className="flex gap-2 items-center">
                          {!autoArrange && (
                            <>
                              <button type="button" onClick={() => moveItem(idx,"left")} className="text-xs px-2 py-1 border rounded"><FaArrowLeft /></button>
                              <button type="button" onClick={() => moveItem(idx,"right")} className="text-xs px-2 py-1 border rounded"><FaArrowRight /></button>
                            </>
                          )}
                          <button type="button" onClick={() => removeAt(idx)} className="text-xs px-2 py-1 bg-red-50 text-red-600 border rounded"><FaTrash /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <motion.button
                disabled={saving || uploading}
                className="w-full md:w-auto px-7 py-4 bg-[#2a0055] text-white rounded-xl font-extrabold text-lg shadow-md flex items-center justify-center gap-2"
                type="submit"
                whileTap={{ scale: 0.97 }}
              >
                {saving ? <FaSpinner className="animate-spin" /> : null}
                {saving ? "Saving..." : "Add Product"}
              </motion.button>
              <motion.button type="button" onClick={() => {
                setForm({ name: "", category: "", description: "", stock: "", price: "", images: [], videos: [], delivery: "" });
                setMediaOrder([]);
              }} className="px-7 py-4 bg-white border rounded-xl font-bold text-lg shadow"
                whileTap={{ scale: 0.94 }}>
                Reset
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
