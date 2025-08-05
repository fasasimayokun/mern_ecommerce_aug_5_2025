import {create} from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";


export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    
    setProducts: (products) => set({products}),

    createProduct: async (productData) => {
      set({ loading: true });
      try {
        const res = await axiosInstance.post("/products", productData);
        toast.success(res.data.message);
        set((prevState) => ({
          products: [...prevState.products, res.data],
          loading: false,
        }));
      } catch (error) {
        toast.error(error.response.data.error);
        set({ loading: false});
      }
    },

    fetchAllProducts: async () => {
      set({ loading: true });
      try {
        const response = await axiosInstance.get("/products");
        set({ products: response.data.products, loading: false });
      } catch (error) {
        set({ error: "Failed to fetch products", loading: false});
        toast.error(error.response.data.error || "Failed to fetch products");
      }
    },

    fetchProductsByCategory: async (category) => {
      set({ loading: true });
      try {
        const response = await axiosInstance.get(`/products/category/${category}`);
        set({ products: response.data.products, loading: false});
      } catch (error) {
        set({ error: "Failed to fetch products", loading: false });
        toast.error(error.response.data.error || "Failed to fetch products");
      }
    },

    deleteProduct: async (productId) => {
      set({ loading: true });
      try {
        await axiosInstance.delete(`/products/${productId}`);
        set((prevProducts) => ({
          products: prevProducts.products.filter((product) => product._id !== productId),
          loading: false,
        }))
      } catch (error) {
        set({ loading: false });
        toast.error(error.response.data.error || "Failed to delete product");        
      }
    },

    toggleFeaturedProduct: async (productId) => {
      set({ loading: true });
      try {
        const response = await axiosInstance.patch(`/products/${productId}`);
        // this will update the isFeatured property of the product in the store
        set((prevProducts) => ({
          products: prevProducts.products.map((product) => (
            product._id === productId ? { ...product, isFeatured: response.data.isFeatured} : product
          )),
          loading: false,
        }));
      } catch (error) {
        toast.error(error.response.data.error || "Failed to update product");
      }
    },

    fetchFeaturedProducts: async () => {
      set({ loading: true });
      try {
        const response = await axiosInstance.get("/products/featured")
        set({ products: response.data, loading: false });
      } catch (error) {
        set({ error: "Failed to fetch products", loading: false });
        console.log("Error fetching featured products:", error);
      }
    },


}));