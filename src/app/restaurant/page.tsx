"use client"
import React from "react";
 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import QRCode from "react-qr-code";
import Header from "@/components/Header";
import OrdersTab from "@/components/OrdersTab";

const RestaurantDashboard = () => {

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "https://taptodine-api.vercel.app";

const [isAuthenticated, setIsAuthenticated] = React.useState(false);
const [authType, setAuthType] = React.useState<"login" | "register">("login");
const [restaurantName, setRestaurantName] = React.useState("");
const [restaurantId, setRestaurantId] = React.useState("");
const [credentials, setCredentials] = React.useState({ email: "", password: "" });

React.useEffect(() => {
  const session = sessionStorage.getItem("tapToDineSession");
  if (session) {
    const parsed = JSON.parse(session);
    setRestaurantId(parsed.restaurantId);
    setRestaurantName(parsed.restaurantName);
    setIsAuthenticated(true);
    fetchMenu(parsed.restaurantId);
    // subscribeToOrders(parsed.restaurantId);
  }
}, []);

const handleAuth = async () => {
  try {
    const endpoint = authType === "login" ? "/login" : "/register";
    const res = await fetch(`${API_HOST}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        ...(authType === "register" && { restaurantName }),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setRestaurantId(data.restaurantId);
      setRestaurantName(data.restaurantName || restaurantName);
      setIsAuthenticated(true);
      sessionStorage.setItem("tapToDineSession", JSON.stringify({
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName || restaurantName,
      }));
      fetchMenu(data.restaurantId);
      // subscribeToOrders(data.restaurantId);
    } else {
      alert(data.message || "Auth failed");
    }
  } catch (err) {
    alert("Error during authentication");
    console.error(err);
  }
};

const handleLogOut = async () => {
   
      setRestaurantId("");
      setRestaurantName("");
      setIsAuthenticated(false);
      setCredentials({ email: "", password: "" });
      sessionStorage.removeItem("tapToDineSession");
      
    }  

 
type MenuItem = {
  id?: string;
  name: string;
  price: number;
};
type NewItem = { name: string; price: string };

const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
const [newItem, setNewItem] = React.useState<NewItem>({ name: "", price: "" });
 

const fetchMenu = async (id: string) => {
  try {
    const res = await fetch(`${API_HOST}/menu/${id}`);
    const data = await res.json();
    if (res.ok) {
      setMenuItems(data);
    }
  } catch (err) {
    console.error("Error fetching menu:", err);
  }
};

// const subscribeToOrders = (restaurantId: string) => {
//   const ws = new WebSocket(`ws://localhost:5000/orders/${restaurantId}`); // Adjust to deployed URL
//   ws.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     if (Array.isArray(data)) setOrders(data);
//   };
//   ws.onerror = (err) => console.error("WebSocket error:", err);
// };

const handleAddItem = async () => {
  if (!newItem.name || !newItem.price || !restaurantId) return;

  try {
    const res = await fetch(`${API_HOST}/menu/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name,
        price: parseFloat(newItem.price),
        restaurantId,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMenuItems([...menuItems, { id: data.id, name: newItem.name, price: parseFloat(newItem.price) }]);
      setNewItem({ name: "", price: "" });
    } else {
      alert("Failed to add item");
    }
  } catch (err) {
    console.error("Error adding item:", err);
  }
};

// const handleEditItem = async (index: number, field: keyof MenuItem, value: string) => {
//   const updatedItems = [...menuItems];
//   const itemToEdit = updatedItems[index];

//   itemToEdit[field] = field === "price" ? parseFloat(value) : value;
//   setMenuItems(updatedItems);

//   if (itemToEdit.id) {
//     try {
//       await fetch(`${API_HOST}/menu/${itemToEdit.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: itemToEdit.name,
//           price: itemToEdit.price,
//         }),
//       });
//     } catch (err) {
//       console.error("Error editing item:", err);
//     }
//   }
// };

 
const handleEditItem = async (
  index: number,
  field: keyof MenuItem,
  value: string
) => {
  const updatedItems = [...menuItems];
  const itemToEdit = updatedItems[index];

  if (field === "price") {
    itemToEdit.price = parseFloat(value);
  } else if (field === "name") {
    itemToEdit.name = value;
  }

  setMenuItems(updatedItems);

  if (itemToEdit.id) {
    try {
      await fetch(`${API_HOST}/menu/${itemToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemToEdit.name,
          price: itemToEdit.price,
        }),
      });
    } catch (err) {
      console.error("Error editing item:", err);
    }
  }
};



const handleDeleteItem = async (index: number) => {
  const itemToDelete = menuItems[index];
  const updatedItems = menuItems.filter((_, i) => i !== index);
  setMenuItems(updatedItems);

  if (itemToDelete?.id) {
    try {
      await fetch(`${API_HOST}/menu/${itemToDelete.id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  }
};


  const printQRCode = () => {
    const printContent = document.getElementById("print-area")?.innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow && printContent) {
      printWindow.document.write("<html><head><title>QR Code</title></head><body>");
      printWindow.document.write(printContent);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isAuthenticated) {
    return (
      
      <><Header/>

     
      <main className="container mx-auto py-10 max-w-md">
        
        <Card>
          <CardHeader>
            <CardTitle>{authType === "login" ? "Login" : "Register"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {authType === "register" && (
              <Input
                placeholder="Restaurant Name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            )}
            <Input
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
            <Input
              placeholder="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
            <Button onClick={handleAuth}>{authType === "login" ? "Login" : "Register"}</Button>
            <p className="text-sm mt-2 text-center">
              {authType === "login" ? (
                <>Don’t have an account?{' '}<button className="text-blue-600" onClick={() => setAuthType("register")}>Register</button></>
              ) : (
                <>Already have an account?{' '}<button className="text-blue-600" onClick={() => setAuthType("login")}>Login</button></>
              )}
            </p>
          </CardContent>
        </Card>
      </main>
      </>
    );
  }

  return (
<>
    <Header/>
    <div className="flex align-bottom flex-col-reverse">
    <Button onClick={handleLogOut}>
        Log Out
      </Button>
      </div>
    <main className="container mx-auto py-10">
    
      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Edit Menu</TabsTrigger>
          <TabsTrigger value="dashboard">QR Code</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
           
          <OrdersTab restaurantId={restaurantId}/>

        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Edit Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) => handleEditItem(idx, "name", e.target.value)}
                    />
                    <Input
                      type="number"
                      value={item.price.toString()}
                      onChange={(e) => handleEditItem(idx, "price", e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => handleDeleteItem(idx)}>Delete</Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                  <Button onClick={handleAddItem}>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Restaurant QR Code</CardTitle>
              <Button onClick={printQRCode} variant="outline">Print QR</Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center" id="print-area">
              <h2 className="text-lg font-semibold mb-2">{restaurantName || "My Restaurant"}</h2>
              <QRCode value={`https://taptodine.com/order/${restaurantId}`} />
              <p className="text-sm mt-4">Scan to view menu and order</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
    </>
  );
};

export default RestaurantDashboard;
