import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axios";
import { LiaEdit } from "react-icons/lia";
import { AiOutlineDelete } from "react-icons/ai";

const StockModal = ({ isOpen, onClose, onSubmit, initialData = {}, mode }) => {
  const [formData, setFormData] = useState({
    productName: "",
    purchasingPrice: "",
    sellingPrice: "",
    quantity: "",
    type: "Mobile",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.productName || "",
        purchasingPrice: initialData.purchasingPrice || "",
        sellingPrice: initialData.sellingPrice || "",
        quantity: initialData.quantity || "",
        type: initialData.type || "",
      });
    } else {
      setFormData({
        productName: "",
        purchasingPrice: "",
        sellingPrice: "",
        quantity: "",
        type: "Mobile",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {mode === "edit" ? "Edit Stock" : "Add Stock"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="productName"
            placeholder="Product Name"
            value={formData.productName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            name="purchasingPrice"
            placeholder="Purchasing Price"
            value={formData.purchasingPrice}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            name="sellingPrice"
            placeholder="Selling Price"
            value={formData.sellingPrice}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Mobile">Mobile</option>
            <option value="Accessory">Accessory</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer border border-black rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer"
            >
              {mode === "edit" ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddStock = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleEditStock = (item) => {
    setEditItem(item);
    console.log(item);
    setIsModalOpen(true);
  };

  const handleDeleteStock = async (id) => {
    try {
      await API.delete(`/stocks/deleteStock/${id}`);
      setItems(items?.filter((item) => item._id !== id));
      console.log("Stock deleted successfully");
    } catch (err) {
      console.error("Error deleting stock:", err);
    }
  };

  const handleSaveStock = async (data) => {
    if (editItem) {

      const res = await API.put(`/stocks/editStock/${editItem._id}`, data);
      setItems(
        items?.map((item) => (item._id === editItem._id ? res.data : item))
      );
      console.log(`Stock updated successfully with id: ${editItem._id}`);
    } else {
      const res = await API.post("/stocks/addStock", data);
      setItems([res.data, ...items]);
      console.log("Stock added successfully with id:", res.data.stock._id);
    }
    setIsModalOpen(false);
  };

  const filteredItems = items?.filter((item) => {
    const name = item.productName ? item.productName.toLowerCase() : "";
    const type = item.type ? item.type.toLowerCase() : "";
    const query = searchQuery.toLowerCase();

    return name.includes(query) || type.includes(query);
  });

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/user/dashboard");
      setUser(res.data.user);
      const stockRes = await API.get("/stocks/getStocks");
      setItems(stockRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [items, isModalOpen]);

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="w-[90%] min-h-screen flex flex-col mx-auto gap-4 p-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">Stock Management</div>
        <button
          onClick={handleAddStock}
          className="cursor-pointer border border-black bg-black text-white p-2 rounded-lg"
        >
          Add Stock
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stock Items</h2>
          <input
            type="text"
            placeholder="Search stock items..."
            className="border rounded-md px-3 py-1 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">Product Name</th>
              <th className="py-2">Purchasing Price</th>
              <th className="py-2">Selling Price</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Type</th>
              <th className="py-2">Date</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems?.map((item, index) => (
              <tr key={item._id || item.id || index} className="border-b">
                <td className="p-2 font-semibold">{item.productName}</td>
                <td className="p-2">{item.purchasingPrice}</td>
                <td className="p-2">{item.sellingPrice}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{item.type}</td>
                <td className="p-2">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : ""}
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    className="cursor-pointer text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg"
                    onClick={() => handleEditStock(item)}
                  >
                    <LiaEdit size={25} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg cursor-pointer"
                    onClick={() => handleDeleteStock(item._id || item.id)}
                  >
                    <AiOutlineDelete size={25} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems?.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveStock}
        initialData={editItem}
        mode={editItem ? "edit" : "add"}
      />
    </div>
  );
};

export default Dashboard;
