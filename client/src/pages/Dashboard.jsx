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
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.productName || "",
        purchasingPrice: initialData.purchasingPrice || "",
        sellingPrice: initialData.sellingPrice || "",
        quantity: initialData.quantity || "",
      });
    } else {
      setFormData({
        productName: "",
        purchasingPrice: "",
        sellingPrice: "",
        quantity: "",
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
  const [searchQuery, setSearchQuery] = useState(""); // 🔎 Search state

  const handleAddStock = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleEditStock = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteStock = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSaveStock = (data) => {
    if (editItem) {
      // update
      setItems(
        items.map((item) =>
          item.id === editItem.id ? { ...item, ...data } : item
        )
      );
    } else {
      // add new
      setItems([...items, { ...data, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  // 🔎 Filter items based on searchQuery
  const filteredItems = items.filter((item) =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/user/dashboard");
      setUser(res.data.user);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [navigate]);

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
              <th className="py-2">Date</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2 font-semibold">{item.productName}</td>
                <td className="p-2">{item.purchasingPrice}</td>
                <td className="p-2">{item.sellingPrice}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">
                  {new Date(item.id).toLocaleDateString()}
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    className="cursor-pointer text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg"
                    onClick={() => handleEditStock(item)}
                  >
                    <LiaEdit size={25}/>
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg cursor-pointer"
                    onClick={() => handleDeleteStock(item.id)}
                  >
                    <AiOutlineDelete size={25}/>
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
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
