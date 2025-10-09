import React from 'react';
import './index.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ShopProvider from './context/ShopContext.jsx'; // ✅ CONTEXT PROVIDER
import 'leaflet/dist/leaflet.css';

import LandingPage from './Pages/LandingPage.jsx';

import ContactUs from './Pages/ContactUs.jsx';
import CartPage from './Pages/CartPage.jsx';
import TrackOrder from './Pages/TrackOrder.jsx';
import Productdetails from './Pages/Productdetails.jsx'; 
import SellerOnBoarding from './Pages/SellerOnBoarding.jsx';
import SellerForm from './Pages/SellerForm.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import SecureCheckout from './Pages/SecureCheckout.jsx';
import WelcomePage from './Pages/WelcomePage.jsx';
import Login from './Pages/Login.jsx';
import AboutUs from './Pages/AboutUs.jsx';
import BrandMarquee from './Pages/BrandMarquee.jsx';
import EditProfile from './Pages/editprofile.jsx';
import ProfilePage from './Pages/profilepage.jsx';
import AuthPage from './Pages/AuthPage.jsx';
import SellerAuthPage from './Pages/SellerAuthPage.jsx';
import Ai from './Components/Ai.jsx';
import HelpCenter from './Pages/HelpCenter.jsx';
import Signup from './Pages/Signup.jsx';
import Category from './Pages/Category.jsx';
import OrderConfirmed from './Pages/OrderConfirmed.jsx';
import Notifications from './Pages/Notifications.jsx'; // Import Notifications page
import ResetPasswordRequest from './Pages/ResetPasswordRequest.jsx';
import ResetPasswordOTP from './Pages/ResetPasswordOTP.jsx';
import ResetPasswordConfirm from './Pages/ResetPasswordConfirm.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ShopProvider> {/* ✅ FIX: wrap entire app with context provider */}
      <BrowserRouter>
        <ScrollToTop /> 
        <Routes>

          <Route path="/" element={<LandingPage />} /> 
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/cartpage" element={<CartPage />} />
          <Route path="/trackorder" element={<TrackOrder />} />
          <Route path="/productdetails" element={<Productdetails />} />
          <Route path="/seller-onboarding" element={<SellerOnBoarding />} />
          <Route path="/sellerform" element={<SellerForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/checkout" element={<SecureCheckout />} />
          <Route path="/welcomepage" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/marque" element={<BrandMarquee />} />
          <Route path="/profile" element={<ProfilePage />} />  
          <Route path="/editprofile" element={<EditProfile />} /> 
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/sellerlogin" element={<SellerAuthPage />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/category" element={<Category />} />
          <Route path="/orderconfirmed" element={<OrderConfirmed />} />
          <Route path="/notifications" element={<Notifications />} /> {/* Add Notifications route */}
          <Route path="/reset-password" element={<ResetPasswordRequest />} />
          <Route path="/reset-password/otp" element={<ResetPasswordOTP />} />
          <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />

          {/* Add more routes as needed */}
          
          {/* Fallback route */}
        </Routes>
        <Ai />
      </BrowserRouter>
    </ShopProvider>
  );
}

export default App;
