import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaComments,
  FaBars,
  FaTimes,
  FaCheck,
  FaCreditCard,
  FaReceipt,
  FaTimesCircle,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const Header = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (authUser) {
          const response = await fetch(`/api/cart/${authUser._id}`);
          if (response.ok) {
            const data = await response.json();
            setCartItems(data.items || []);
          }
        } else {
          // For non-logged in users, check localStorage
          const localCart = JSON.parse(localStorage.getItem('cart')) || [];
          setCartItems(localCart);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [authUser]);

  const handleUserClick = () => {
    if (authUser) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleChatClick = () => {
    navigate("/chat");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Calculate total items in cart
  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle checkout button click
  const handleCheckoutClick = () => {
    if (cartItemCount > 0) {
      setIsCheckoutOpen(true);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        if (authUser) {
          // Clear cart in database
          await fetch(`/api/cart/${authUser._id}`, {
            method: 'DELETE',
          });
        } else {
          // Clear cart in localStorage
          localStorage.removeItem('cart');
        }
        
        // Update cart state
        setCartItems([]);
        
        // Show success message
        setIsPaymentSuccess(true);
        
        // Close checkout popup after 3 seconds
        setTimeout(() => {
          setIsCheckoutOpen(false);
          setIsPaymentSuccess(false);
        }, 3000);
      } catch (error) {
        console.error("Error processing payment:", error);
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  // Close checkout popup
  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setIsPaymentSuccess(false);
  };

  return (
    <header className="fixed w-full top-0 z-50">
      {/* Gradient background with noise texture */}
      <div className={`
        absolute inset-0 transition-all duration-500
        ${isScrolled 
          ? "bg-gradient-to-r from-emerald-50/80 via-white/95 to-green-50/80 backdrop-blur-md" 
          : "bg-gradient-to-r from-emerald-50/60 via-white/80 to-green-50/60 backdrop-blur-sm"
        }
      `}>
        {/* Animated gradient lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-3/4 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-slide-right"></div>
            <div className="absolute top-0 -right-4 w-3/4 h-px bg-gradient-to-l from-transparent via-emerald-500 to-transparent animate-slide-left"></div>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className={`relative transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}>
        <div className="container mx-auto px-5">
          <div className="flex justify-between items-center">
            {/* Unified Logo and Brand Container */}
            <Link to="/" className="group relative">
              <div className="flex items-center">
                {/* Unified Glassmorphism Container */}
                <div className="relative flex items-center bg-white/20 backdrop-blur-md rounded-full pr-6 border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300">
                  {/* Logo Section */}
                  <div className="relative p-2">
                    <img 
                      src="/src/Images/logo.png" 
                      alt="Logo" 
                      className="h-10 w-10 object-contain" 
                    />
                  </div>

                  {/* Brand Name */}
                  <div className="relative ml-2">
                    <span className="text-2xl font-semibold text-green-500">
                      AgriGrow
                    </span>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { path: "/", label: "Home" },
                { path: "/about", label: "About" },
                { path: "/service", label: "Services" },
                { path: "/blog", label: "Blog" },
                { path: authUser?.role === "admin" ? "/products" : "/shop", 
                  label: authUser?.role === "admin" ? "Products" : "Shop" },
                { path: "/contact", label: "Contact" }
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`
                    relative px-4 py-2 group rounded-xl transition-all duration-300
                    ${isActive(item.path) 
                      ? "text-green-600" 
                      : "text-gray-600 hover:text-green-600"
                    }
                  `}
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className={`
                    absolute inset-0 rounded-xl transition-all duration-300 group-hover:bg-green-50/50
                    ${isActive(item.path) ? "bg-green-50/80" : ""}
                  `}></div>
                  {isActive(item.path) && (
                    <div className="absolute -bottom-px left-2 right-2 h-0.5 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Section: Search, Cart, Chat, Profile */}
            <div className="flex items-center space-x-1">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-xl hover:bg-green-50/80 transition-all duration-300 group"
              >
                <FaSearch className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              </button>

              {/* Cart Button */}
              {authUser?.role !== "admin" && (
                <div className="flex items-center">
                  <button
                    onClick={handleCartClick}
                    className="p-2 rounded-xl hover:bg-green-50/80 transition-all duration-300 group relative"
                  >
                    <FaShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/20">
                        {cartItemCount}
                      </span>
                    )}
                  </button>

                  {cartItemCount > 0 && (
                    <button
                      onClick={handleCheckoutClick}
                      className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 group flex items-center space-x-2"
                    >
                      <FaReceipt className="w-4 h-4 transition-transform group-hover:rotate-12" />
                      <span>Checkout</span>
                    </button>
                  )}
                </div>
              )}

              {/* Chat Button */}
              {authUser && (
                <button
                  onClick={handleChatClick}
                  className="p-2 rounded-xl hover:bg-green-50/80 transition-all duration-300 group relative"
                >
                  <FaComments className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                </button>
              )}

              {/* Profile Button */}
              <button
                onClick={handleUserClick}
                className="p-2 rounded-xl hover:bg-green-50/80 transition-all duration-300 group relative"
              >
                <FaUser className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-green-50/80 transition-all duration-300 relative group"
              >
                <div className="w-6 space-y-1.5">
                  <div className={`h-0.5 bg-gray-600 group-hover:bg-green-600 transition-all duration-300 ${
                    isMobileMenuOpen ? "transform rotate-45 translate-y-2" : ""
                  }`}></div>
                  <div className={`h-0.5 bg-gray-600 group-hover:bg-green-600 transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}></div>
                  <div className={`h-0.5 bg-gray-600 group-hover:bg-green-600 transition-all duration-300 ${
                    isMobileMenuOpen ? "transform -rotate-45 -translate-y-2" : ""
                  }`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`
        relative transform transition-all duration-300 ease-in-out
        ${isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
      `}>
        <div className="absolute inset-x-0 top-0 bg-white/80 backdrop-blur-md shadow-lg">
          <div className="container mx-auto px-5 py-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search for fresh produce..."
                className="w-full px-4 py-3 rounded-l-xl bg-white/50 border border-gray-200 focus:outline-none focus:border-green-500 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-r-xl hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 flex items-center"
              >
                <FaSearch className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`
        md:hidden relative transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
      `}>
        <div className="absolute inset-x-0 top-0 bg-white/80 backdrop-blur-md shadow-lg">
          <div className="container mx-auto px-5 py-4">
            <nav className="flex flex-col space-y-1">
              {[
                { path: "/", label: "Home" },
                { path: "/about", label: "About" },
                { path: "/service", label: "Services" },
                { path: "/blog", label: "Blog" },
                { path: authUser?.role === "admin" ? "/products" : "/shop", 
                  label: authUser?.role === "admin" ? "Products" : "Shop" },
                { path: "/contact", label: "Contact" }
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`
                    px-4 py-3 rounded-xl transition-all duration-300 group relative
                    ${isActive(item.path) 
                      ? "bg-green-50/80 text-green-600" 
                      : "text-gray-600 hover:bg-green-50/50 hover:text-green-600"
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="absolute left-2 right-2 bottom-1.5 h-0.5 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Checkout Receipt Popup */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-slideUp">
            {/* Receipt Header */}
            <div className="bg-green-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaReceipt size={20} />
                <h3 className="text-lg font-semibold">Order Receipt</h3>
              </div>
              <button 
                onClick={closeCheckout}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            
            {/* Receipt Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {isPaymentSuccess ? (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheck size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600">Your order has been placed successfully.</p>
                  <p className="text-gray-600 mt-2">Thank you for shopping with us!</p>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.image || "/src/Images/placeholder.jpg"} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-800">{formatPrice(item.price * (item.quantity || 1))}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatPrice(totalPrice * 0.1)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2 mt-2">
                      <span>Total</span>
                      <span className="text-green-600">{formatPrice(totalPrice * 1.1)}</span>
                    </div>
                  </div>
                  
                  {/* Payment Button */}
                  <button
                    className="w-full bg-green-600 text-white py-3 rounded-md mt-6 flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaCreditCard size={16} />
                        <span>Pay Now</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

// Add this to your CSS/Tailwind config
/*
@keyframes slide-right {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

@keyframes slide-left {
  from { transform: translateX(100%); }
  to { transform: translateX(-100%); }
}

.animate-slide-right {
  animation: slide-right 3s linear infinite;
}

.animate-slide-left {
  animation: slide-left 3s linear infinite;
}
*/