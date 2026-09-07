import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserRegister from '../pages/auth/UserRegister';
import ChooseRegister from '../pages/auth/ChooseRegister';
import UserLogin from '../pages/auth/UserLogin';
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister';
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin';
import Home from '../pages/general/Home';
import Saved from '../pages/general/Saved';
import BottomNav from '../components/BottomNav';
import CreateFood from '../pages/food-partner/CreateFood';
import Profile from '../pages/food-partner/Profile';
import PartnerOrders from '../pages/food-partner/PartnerOrders';
import Cart from '../pages/general/Cart';
import Checkout from '../pages/general/Checkout';
import MyOrders from '../pages/general/MyOrders';
import PartnerHome from '../pages/food-partner/PartnerHome';
import MyFood from '../pages/food-partner/MyFood';
import ChooseLogin from '../pages/auth/ChooseLogin';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<ChooseRegister />} />
                <Route path="/login" element={<ChooseLogin />} />
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
                <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
                <Route path="/" element={<ChooseLogin />} />
                <Route path="/home" element={<><Home /><BottomNav /></>} />
                <Route path="/saved" element={<><Saved /><BottomNav /></>} />
                <Route path="/partner-home" element={<PartnerHome />} />
                <Route path="/create-food" element={<CreateFood />} />
                <Route path="/food-partner/my-food" element={<MyFood />} />
                <Route path="/food-partner/:id" element={<Profile />} />
                <Route path="/food-partner/orders" element={<PartnerOrders />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<MyOrders />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes