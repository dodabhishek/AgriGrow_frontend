import { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { axiosInstance } from "../../../lib/axios";
import React from "react";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

const Card = ({ name, description, price, imageUrl, productId, onProductUpdate, onProductDelete }) => {
  const { authUser } = useAuthStore();
  const fallbackImage = "/images/Basket.jpg";
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ name, description, price, imageUrl });

  const [quantity, setQuantity] = useState(1);
  const basePrice = price;

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!authUser) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      setIsAddingToCart(true);

      const cartResponse = await axiosInstance.get("/cart", {
        params: { userId: authUser._id }
      });

      const cartItems = cartResponse.data.cart || [];
      const productAlreadyInCart = cartItems.some(item => 
        item.productId._id === productId
      );

      if (productAlreadyInCart) {
        toast.error("This product is already in your cart");
        return;
      }

      await axiosInstance.post("/cart", {
        userId: authUser._id,
        productId,
        quantity,
      });

      toast.success("Product added to cart successfully");
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      toast.error(error.response?.data?.message || "Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleEditProduct = () => {
    if (!productId) {
      console.error("Product ID is missing");
      return;
    }
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!productId) {
      console.error("Product ID is missing");
      return;
    }

    try {
      setIsEditing(true);
      const response = await axiosInstance.put(`/products/${productId}`, editedProduct);
      onProductUpdate(response.data.product);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating product:", error.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productId) {
      console.error("Product ID is missing");
      return;
    }

    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/products/${productId}`);
      onProductDelete(productId);
    } catch (error) {
      console.error("Error deleting product:", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setEditedProduct({ name, description, price, imageUrl });
  }, [name, description, price, imageUrl]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <img
        src={imageUrl || fallbackImage}
        alt={name}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <h3 className="text-lg font-bold mt-2">{name}</h3>
      <p className="text-gray-600">{description}</p>
      <p className="text-gray-800 font-semibold mt-2">Price: ${basePrice * quantity}</p>

      {/* Quantity Controls */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={decreaseQuantity}
          className="px-3 py-1 bg-red-500 text-white rounded"
          disabled={quantity === 1}
        >
          −
        </button>
        <span className="text-lg font-semibold">{quantity}</span>
        <button
          onClick={increaseQuantity}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          +
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-4">
        {authUser?.role === "admin" ? (
          <>
            <button
              onClick={handleEditProduct}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
              disabled={isEditing || isDeleting}
            >
              {isEditing ? <><Loader className="size-4 animate-spin" /> Editing...</> : "Edit"}
            </button>
            <button
              onClick={handleDeleteProduct}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
              disabled={isEditing || isDeleting}
            >
              {isDeleting ? <><Loader className="size-4 animate-spin" /> Deleting...</> : "Delete"}
            </button>
          </>
        ) : (
          <button
            onClick={handleAddToCart}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
            disabled={isAddingToCart}
          >
            {isAddingToCart ? <><Loader className="size-4 animate-spin" /> Adding...</> : "Add to Cart"}
          </button>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>

            <input
              type="text"
              placeholder="Product Name"
              value={editedProduct.name || ""}
              onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
              className="border rounded w-full px-4 py-2 mb-2"
              disabled={isEditing}
            />

            <textarea
              placeholder="Product Description"
              value={editedProduct.description || ""}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
              className="border rounded w-full px-4 py-2 mb-2"
              disabled={isEditing}
            />

            <input
              type="number"
              placeholder="Price"
              value={editedProduct.price || ""}
              onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
              className="border rounded w-full px-4 py-2 mb-2"
              disabled={isEditing}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                disabled={isEditing}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                disabled={isEditing}
              >
                {isEditing ? <><Loader className="size-4 animate-spin" /> Saving...</> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
