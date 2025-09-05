import { useEffect, useState } from "react";
import API from "../utils/axios.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { AiOutlineDelete } from "react-icons/ai";

const Invoice = () => {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [productList, setProductList] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState(1);
  const [defaultPrice, setDefaultPrice] = useState("");
  const [savedInvoice, setSavedInvoice] = useState([]);
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState(null);

  const [filterDate, setFilterDate] = useState("");

  const filteredInvoices = savedInvoice.filter((inv) => {
    if (!filterDate) return true;
    const invoiceDate = new Date(inv.date).toISOString().split("T")[0];
    console.log(invoiceDate);
    console.log(filterDate);
    return invoiceDate === filterDate;
  });

  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const totalGST = invoiceItems.reduce((sum, item) => sum + item.gst, 0);
  const totalAmount = subtotal + totalGST;

  const handleAddItem = () => {
    if (!selectedProductId) {
      alert("Please select a product");
      return;
    }

    if (!customerName) {
      alert("Please enter customer name");
      return;
    }

    if (!customerNumber) {
      alert("Please enter customer number");
      return;
    }

    const product = productList.find((p) => p._id === selectedProductId);
    if (!product) return;

    let basePrice = customPrice
      ? parseFloat(customPrice)
      : product.sellingPrice;
    let gst = 0;

    if (product.type === "Mobile") {
      gst = basePrice * 0.18;
    }

    const newItem = {
      name: product.productName,
      type: product.type,
      qty: quantity,
      price: basePrice,
      gst: gst,
      total: basePrice * quantity + gst,
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setSelectedProductId("");
    setQuantity(1);
    setCustomPrice("");
    setDefaultPrice("");
  };

  const handleClearInvoice = () => {
    setCustomerName("");
    setCustomerNumber("");
    setInvoiceItems([]);
    setQuantity(1);
    setCustomPrice("");
    setSelectedProductId("");
    setDefaultPrice("");
  };

  const handlePrintInvoice = () => {
    setSelectedInvoiceToPrint(null);
    window.print();
  };

  const handleViewInvoice = (invoice) => {
    console.log(invoice);
    setSelectedInvoiceToPrint(invoice);
    setTimeout(() => {
      window.print();
      setSelectedInvoiceToPrint(null);
    }, 100);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await API.delete(`/invoices/${invoiceId}`);
      alert(res.data.message);

      setSavedInvoice(savedInvoice.filter((inv) => inv._id !== invoiceId));

      console.log(`Invoice with ID ${invoiceId} deleted successfully.`);
    } catch (error) {
      console.error(
        "Error deleting invoice:",
        error.response?.data?.message || error.message
      );
      alert(error.response?.data?.message || "Failed to delete the invoice.");
    }
  };

  const handleSaveInvoice = async () => {
    if (!customerName || !customerNumber || invoiceItems?.length === 0) {
      alert("Please fill out customer details and add items to the invoice.");
      return;
    }
    try {
      const invoiceData = {
        customerName,
        customerNumber,
        items: invoiceItems,
        subTotal: subtotal,
        gstTotal: totalGST,
        totalAmount: totalAmount,
        userId: user?.id,
      };

      const res = await API.post("/invoices/saveInvoice", invoiceData);
      alert("Invoice saved successfully!");
      console.log("Saved Invoice:", res.data.invoice);
      setSavedInvoice([res.data.invoice, ...savedInvoice]);
      setInvoiceNo(res.data.invoice.invoiceNo + 1);
      handleClearInvoice();
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const productRes = await API.get("/stocks/getStocks");
          setProductList(productRes.data);

          const invoiceRes = await API.get(
            `/invoices/getInvoices?userId=${user?.id}`
          );
          setSavedInvoice(invoiceRes.data);
          if (invoiceRes.data?.length > 0) {
            const lastInvoice = invoiceRes.data.sort(
              (a, b) => b.invoiceNo - a.invoiceNo
            )[0];
            setInvoiceNo(lastInvoice.invoiceNo + 1);
          } else {
            setInvoiceNo(1);
          }
        }
      } catch (err) {
        console.log("Error fetching data", err);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="p-6">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-invoice, #printable-invoice * {
              visibility: visible;
            }
            #printable-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            #single-invoice-print, #single-invoice-print * {
              visibility: visible;
            }
            #single-invoice-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .invoice-preview-container {
              display: none;
            }
          }
        `}
      </style>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Invoice Generator</h1>
        <div className="flex gap-4 justify-center items-center mb-4">
          <button
            onClick={handleSaveInvoice}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Save Invoice
          </button>
          <button
            onClick={handleClearInvoice}
            className="bg-white border px-4 py-2 rounded-lg cursor-pointer"
          >
            Clear Invoice
          </button>
          <button
            onClick={handlePrintInvoice}
            className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Print Invoice
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="p-4 h-full rounded-lg bg-white shadow">
          <label className="block mb-2 font-semibold">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border w-full p-2 rounded-lg mb-4"
            placeholder="Enter customer name"
          />

          <label className="block mb-2 font-semibold" htmlFor="customerNumber">
            Customer Number
          </label>
          <input
            type="text"
            id="customerNumber"
            className="border w-full p-2 rounded-lg mb-4"
            value={customerNumber}
            onChange={(e) => setCustomerNumber(e.target.value)}
            placeholder="Enter customer number"
          />

          <label className="block mb-2 font-semibold">Select Product</label>
          <select
            type="text"
            value={selectedProductId}
            onChange={(e) => {
              const productId = e.target.value;
              setSelectedProductId(productId);
              const selectedProduct = productList.find(
                (p) => p._id === productId
              );
              if (selectedProduct) {
                setDefaultPrice(selectedProduct.sellingPrice);
              } else {
                setDefaultPrice("");
              }
            }}
            className="border w-full p-2 rounded-lg mb-4"
            placeholder="Enter product name"
          >
            <option value="">-- Choose a product --</option>
            {productList?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.productName}
              </option>
            ))}
          </select>

          <div className="flex gap-4">
            <div>
              <label className="block mb-2 font-semibold">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border w-full p-2 rounded-lg mb-4"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Default Price</label>
              <input
                type="number"
                value={defaultPrice}
                readOnly
                className="border w-full p-2 rounded-lg mb-4 bg-gray-100 cursor-not-allowed"
                placeholder="Default price"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Custom Price</label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="border w-full p-2 rounded-lg mb-4"
                placeholder="Override price"
              />
            </div>
          </div>

          <button
            onClick={handleAddItem}
            className="bg-black cursor-pointer text-white px-4 py-2 rounded-lg w-full"
          >
            + Add to Invoice
          </button>
        </div>

        <div id="printable-invoice" className="p-4 w-2/3 bg-white shadow">
          <div className="text-2xl font-bold text-center mb-2">Tax Invoice</div>
          <div className="flex border border-black justify-between">
            <div className="flex flex-col gap-2 p-4">
              <p className="font-bold text-lg">{user?.companyName}</p>
              <p className="text-sm">{user?.address}</p>
              <p className="text-sm">
                Phone No.: {user?.primaryNumber} {", " && user?.alternateNumber}
              </p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <p>
                <b>Invoice No.:</b> {invoiceNo}
              </p>
              <p>
                <b>Date:</b> {new Date().toISOString().split("T")[0].split("-").reverse().join("/")}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between border-l border-r border-b border-black p-4">
            <div className="flex gap-2">
              <p className="font-bold">Bill To:</p>
              <p>{customerName}</p>
            </div>
            <div className="flex gap-2">
              <p className="font-bold">Contact No.:</p>
              <p>{customerNumber}</p>
            </div>
          </div>

          <table className="w-full border-b border-l border-r border-black mt-0">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-r border-black px-2">Item</th>
                <th className="border-r border-black px-2">Type</th>
                <th className="border-r border-black px-2">Qty</th>
                <th className="border-r border-black px-2">Price</th>
                <th className="border-r border-black px-2">CGST (9%)</th>
                <th className="border-r border-black px-2">SGST (9%)</th>
                <th className="border-black px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems?.length === 0 ? (
                <tr className="border-t border-black">
                  <td className="border-r border-black px-2">No items added</td>
                </tr>
              ) : (
                invoiceItems?.map((item, index) => (
                  <tr className="border-t border-black" key={index}>
                    <td className="border-r border-black px-2">{item.name}</td>
                    <td className="border-r border-black px-2">{item.type}</td>
                    <td className="border-r border-black px-2">{item.qty}</td>
                    <td className="border-r border-black px-2">
                      ₹{item.price}
                    </td>
                    <td className="border-r border-black px-2">
                      ₹{(item.gst / 2).toFixed(2)}
                    </td>
                    <td className="border-r border-black px-2">
                      ₹{(item.gst / 2).toFixed(2)}
                    </td>
                    <td className=" border-black px-2">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-between border border-black p-4">
            <div className="flex flex-col gap-2">
              <p className="flex gap-1">
                <b>Taxable Amount:</b>₹{subtotal.toFixed(2)}
              </p>
              <p>
                <b>CGST Amount:</b>₹{(totalGST / 2).toFixed(2)}
              </p>
              <p>
                <b>SGST Amount:</b>₹{(totalGST / 2).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center underline">
              <p className="flex gap-1">
                <b>Final Amount:</b>₹{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Saved Invoices</h2>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
        </div>
        {filteredInvoices?.length === 0 ? (
          <p>No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">
                    Invoice No
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">
                    Customer
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">
                    Date
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">
                    Total Amount
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices?.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b border-gray-300">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {inv.customerName}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {new Date(inv.date).toISOString().split("T")[0].split("-").reverse().join("/")}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      ₹{inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="flex gap-2 py-2 px-4 border-b border-gray-300">
                      <button
                        onClick={() => handleViewInvoice(inv)}
                        className="bg-blue-700 cursor-pointer text-white px-3 py-1 rounded-lg text-sm"
                      >
                        View & Print
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(inv._id)}
                        className=" text-red-500 hover:text-red-700 cursor-pointer px-3 py-1 text-sm"
                      >
                        <AiOutlineDelete size={25} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoiceToPrint && (
        <div id="single-invoice-print" className="p-4 bg-white shadow">
          <div className="text-2xl font-bold text-center mb-2">Tax Invoice</div>
          <div className="flex border border-black justify-between">
            <div className="flex flex-col gap-2 p-4">
              <p className="font-bold text-lg">{user?.companyName}</p>
              <p className="text-sm">{user?.address}</p>
              <p className="text-sm">
                Phone No.: {user?.primaryNumber} {", " && user?.alternateNumber}
              </p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <p>
                <b>Invoice No.:</b> {selectedInvoiceToPrint.invoiceNo}
              </p>
              <p>
                <b>Date:</b>{" "}
                {new Date(selectedInvoiceToPrint.date).toISOString().split("T")[0].split("-").reverse().join("/")}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between border-l border-r border-b border-black p-4">
            <div className="flex gap-2">
              <p className="font-bold">Bill To:</p>
              <p>{selectedInvoiceToPrint.customerName}</p>
            </div>
            <div className="flex gap-2">
              <p className="font-bold">Contact No.:</p>
              <p>{selectedInvoiceToPrint.customerNumber}</p>
            </div>
          </div>
          <table className="w-full border-b border-l border-r border-black mt-0">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-r border-black px-2">Item</th>
                <th className="border-r border-black px-2">Type</th>
                <th className="border-r border-black px-2">Qty</th>
                <th className="border-r border-black px-2">Price</th>
                <th className="border-r border-black px-2">CGST (9%)</th>
                <th className="border-r border-black px-2">SGST (9%)</th>
                <th className="border-black px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoiceToPrint?.items?.map((item, index) => (
                <tr className="border-t border-black" key={index}>
                  <td className="border-r border-black px-2">{item.name}</td>
                  <td className="border-r border-black px-2">{item.type}</td>
                  <td className="border-r border-black px-2">{item.qty}</td>
                  <td className="border-r border-black px-2">₹{item.price}</td>
                  <td className="border-r border-black px-2">
                    ₹{(item.gst / 2).toFixed(2)}
                  </td>
                  <td className="border-r border-black px-2">
                    ₹{(item.gst / 2).toFixed(2)}
                  </td>
                  <td className=" border-black px-2">
                    ₹{item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between border border-black p-4">
            <div className="flex flex-col gap-2">
              <p className="flex gap-1">
                <b>Taxable Amount:</b>₹
                {selectedInvoiceToPrint.subTotal.toFixed(2)}
              </p>
              <p>
                <b>CGST Amount:</b>₹
                {(selectedInvoiceToPrint.gstTotal / 2).toFixed(2)}
              </p>
              <p>
                <b>SGST Amount:</b>₹
                {(selectedInvoiceToPrint.gstTotal / 2).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center underline">
              <p className="flex gap-1">
                <b>Final Amount:</b>₹
                {selectedInvoiceToPrint.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
