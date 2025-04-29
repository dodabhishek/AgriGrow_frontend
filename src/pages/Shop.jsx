import React, { useState, useEffect } from "react";
import ProductCard from "./AdminPage/Card/productCard";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 100]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const itemsPerPage = 9;
  const { authUser } = useAuthStore();
  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/products");
        if (Array.isArray(res.data.products)) {
          setProducts(res.data.products);
          setFilteredProducts(res.data.products);
        } else {
          console.error("Unexpected API response format");
        }
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    "All",
    "Vegetables",
    "Fruits",
    "Grains",
    "Pulses",
    "Seeds",
    "Fertilizers",
    "Tools"
  ];

  const handleSearch = () => {
    const result = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === "All" || product.category === selectedCategory) &&
        product.price >= appliedPriceRange[0] &&
        product.price <= appliedPriceRange[1]
    );
    setFilteredProducts(result);
    setCurrentPage(1);
  };

  const applyPriceFilter = () => {
    console.log("Price Range Applied:", priceRange); // Log to debug
    setAppliedPriceRange(priceRange); // Update applied price range
    handleSearch(); // Re-apply the search with the updated price range
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await axiosInstance.post("/add-to-cart", {
        userId: authUser._id,
        productId,
      });
      console.log(response.data.message);
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
    }
  };

  const openProductPopup = (product) => {
    setSelectedProduct(product);
  };

  const closePopup = () => {
    setSelectedProduct(null);
  };

  const goToCart = () => {
    window.location.href = "/cart";
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-0 p-6">
      <div className="text-center py-10">
        <img src="/images/ShopHeader.jpg" alt="Shop Header" className="w-full mx-auto" />
      </div>

      <div className="grid grid-cols-4 gap-6">
        <aside className="col-span-1 border p-4 rounded-lg">
          <div className="border p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Price</h3>
            <div className="flex justify-between text-sm">
              <span>Min: ${priceRange[0]}</span>
              <span>Max: ${priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full mt-2"
            />
            <input
              type="range"
              min={priceRange[0]}
              max="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full mt-2"
            />
            <button className="mt-2 w-full bg-green-500 text-white p-2 rounded" onClick={applyPriceFilter}>
              Apply
            </button>
          </div>

          <h3 className="font-bold mb-2">Categories</h3>
          <ul>
            {categories.map((category) => (
              <li
                key={category}
                className={`cursor-pointer p-2 border-b last:border-none ${
                  selectedCategory === category ? "font-bold text-green-600" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </aside>

        <main className="col-span-3">
          <div className="flex justify-center mb-6">
            <input
              type="text"
              className="border p-2 w-full max-w-md rounded-md"
              placeholder="Search for a product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-green-500 text-white px-6 py-2 ml-4 rounded-md"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {paginatedProducts.length > 0 ? (
              
              paginatedProducts.map((product) => (
                
                <ProductCard
                  key={product._id}
                  productId={product._id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  onAddToCart={() => handleAddToCart(product._id)}
                  showControls={true}
                  onClick={() => openProductPopup(product)} // Trigger the popup when clicking on the product
                />
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-3">Product not available.</p>
            )}
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`p-2 ${currentPage === num ? "bg-green-500 text-white" : "bg-gray-200"}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </main>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
          <div className="bg-white w-full md:w-1/2 h-1/2 rounded-t-2xl p-6 overflow-auto relative">
            <button
              onClick={closePopup}
              className="absolute top-2 right-4 text-gray-600 text-xl font-bold"
            >
              &times;
            </button>
            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-40 object-contain mb-4" />
            <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
            <p className="text-gray-700">Price: ${selectedProduct.price}</p>
            <button
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              onClick={goToCart}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
