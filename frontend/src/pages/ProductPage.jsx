import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";

// Sample products fallback (shown when API is unavailable or returns empty)
const sampleProducts = [
  {
    id: "sample-1",
    name: "Sample Product A",
    sku: "SAMPLE-A",
    price: "10.00",
    stockQuantity: 50,
    imageUrl: "https://via.placeholder.com/150"
  },
  {
    id: "sample-2",
    name: "Sample Product B",
    sku: "SAMPLE-B",
    price: "15.00",
    stockQuantity: 30,
    imageUrl: "https://via.placeholder.com/150"
  },
  {
    id: "sample-3",
    name: "Sample Product C",
    sku: "SAMPLE-C",
    price: "20.00",
    stockQuantity: 20,
    imageUrl: "https://via.placeholder.com/150"
  }
];

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  // Sample products fallback (shown when API is unavailable or returns empty)
  const sampleProducts = [
    {
      id: "sample-1",
      name: "Sample Product A",
      sku: "SAMPLE-A",
      price: "10.00",
      stockQuantity: 50,
      imageUrl: "https://via.placeholder.com/150"
    },
    {
      id: "sample-2",
      name: "Sample Product B",
      sku: "SAMPLE-B",
      price: "15.00",
      stockQuantity: 30,
      imageUrl: "https://via.placeholder.com/150"
    },
    {
      id: "sample-3",
      name: "Sample Product C",
      sku: "SAMPLE-C",
      price: "20.00",
      stockQuantity: 20,
      imageUrl: "https://via.placeholder.com/150"
    }
  ];

  const navigate = useNavigate();

  const [useSample, setUseSample] = useState(false);

  //Pagination Set-Up
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // fetch products (extracted so we can call it from retry or other controls)
  const getProducts = async () => {
    try {
      const productData = await ApiService.getAllProducts();

      if (
        productData &&
        productData.status === 200 &&
        Array.isArray(productData.products) &&
        productData.products.length > 0
      ) {
        setTotalPages(Math.ceil(productData.products.length / itemsPerPage));

        setProducts(
          productData.products.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )
        );
      } else {
        // Fallback to sample products so UI shows something when backend is not available
        setTotalPages(Math.ceil(sampleProducts.length / itemsPerPage));
        setProducts(
          sampleProducts.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )
        );
        showMessage("No products from API — showing sample products.");
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Getting Products: " + error
      );
      // On error (e.g. backend offline) show sample products as a fallback
      setTotalPages(Math.ceil(sampleProducts.length / itemsPerPage));
      setProducts(
        sampleProducts.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )
      );
    }
  };

  useEffect(() => {
    if (useSample) {
      // show sample products when toggle is enabled
      setTotalPages(Math.ceil(sampleProducts.length / itemsPerPage));
      setProducts(
        sampleProducts.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )
      );
      showMessage("Showing sample products (toggle enabled).");
      return;
    }

    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, useSample]);

  //Delete a product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this Product?")) {
      try {
        await ApiService.deleteProduct(productId);
        showMessage("Product sucessfully Deleted");
        window.location.reload(); //relode page
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Error Deleting in a product: " + error
        );
      }
    }
  };

  //metjhod to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}

      <div className="product-page">
        <div className="product-header">
          <h1>Products</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="add-product-btn"
              onClick={() => navigate("/add-product")}
            >
              Add Product
            </button>

            <button
              className="secondary-btn"
              onClick={() => {
                // retry API call
                setUseSample(false);
                getProducts();
              }}
            >
              Retry API
            </button>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={useSample}
                onChange={(e) => setUseSample(e.target.checked)}
              />
              Use sample data
            </label>
          </div>
        </div>

        {products && (
          <div className="product-list">
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <img
                  className="product-image"
                  src={product.imageUrl}
                  alt={product.name || "Product Image"}
                />

                <div className="product-info">
                    <h3 className="name">{product.name}</h3>
                    <p className="sku">Sku: {product.sku}</p>
                    <p className="price">Price: {product.price}</p>
                    <p className="quantity">Quantity: {product.stockQuantity}</p>
                </div>

                <div className="product-actions">
                    <button className="edit-btn" onClick={()=> navigate(`/edit-product/${product.id}`)}>Edit</button>
                    <button  className="delete-btn" onClick={()=> handleDeleteProduct(product.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaginationComponent
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      />
    </Layout>
  );
};
export default ProductPage;
