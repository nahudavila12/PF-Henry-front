import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ICartItem, IOrder } from "@/interfaces/Menu-item.interfaces";
import { createOrder } from "@/helpers/menu-items.helper";
import UserDataForm from "@/components/specific/TakeAway/OrderForm/UserDataForm";
import CommentsForm from "@/components/specific/TakeAway/OrderForm/CommentsForm";
import PaymentMethodForm from "@/components/specific/TakeAway/OrderForm/PaymentMethodForm";
import OrderSummary from "@/components/specific/TakeAway/OrderForm/OrderSummary";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";

const OrderForm: React.FC = () => {
  const { cartItems, total, clearCart } = useCart();
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    comments: string;
    paymentMethod: "Cash" | "PayPal";
    id: string;
  }>({
    name: "",
    email: "",
    comments: "",
    paymentMethod: "Cash",
    id: "",
  });

  const [showPayPal, setShowPayPal] = useState(false);
  const [isOrderCreated, setIsOrderCreated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.name && user.email && user.id) {
        setFormData((prev) => ({ ...prev, name: user.name, email: user.email, id: user.id }));
      }
    }
  }, []);

  useEffect(() => {
    if (isOrderCreated) {
      setTimeout(() => {
        router.push("/orders");
      }, 1000);
    }
  }, [isOrderCreated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name === "paymentMethod" && value === "PayPal") {
      setShowPayPal(true);
    } else {
      setShowPayPal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const menuItems = cartItems
      .filter((item) => item.type === "menuItem")
      .map((item: ICartItem) => ({
        idMenuItem: item.id,
        quantity: item.quantity,
      }));

    const combos = cartItems
      .filter((item) => item.type === "combo")
      .map((item: ICartItem) => ({
        idCombo: item.id,
        quantity: item.quantity,
      }));

    const allItems = [
      ...menuItems,
      ...combos
    ];

    console.log(formData);
    

    const orderData: IOrder = {
      idUser: formData.id,
      paymentMethod: formData.paymentMethod,
      comment: formData.comments,
      MenuItems: allItems.length > 0 ? allItems : [],
    };

    // console.log(orderData);
    

    console.log("Order data being sent:", JSON.stringify(orderData, null, 2));

    if (!orderData.idUser) {
      alert("User ID is required to place the order.");
      return;
    }

    try {
      console.log("estoy en el try");
      
      const a = await createOrder(orderData);
      console.log(a);
      
      clearCart();
      alert("Order placed successfully!");
      setIsOrderCreated(true);
    } catch {
      alert("There was an error placing your order.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <UserDataForm 
          name={formData.name} 
          email={formData.email} 
        />
        <CommentsForm 
          comments={formData.comments} 
          handleChange={handleChange} 
        />
        <PaymentMethodForm 
          paymentMethod={formData.paymentMethod} 
          handleChange={handleChange} 
        />
        <OrderSummary total={total} />
        {!showPayPal && (
          <button
            type="submit"
            className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-600"
          >
            Confirm Order
          </button>
        )}
      </form>

      {showPayPal && (
        <PayPalScriptProvider
          options={{
            clientId: "AeTVy8fpYKvZ_q372W1dasinGPVVFwUAQ5Lfh_gFd73-G6218PUgYkWTDE6NPY78_pNh4XhEVXf5ieFv", //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            currency: "USD",
          }}
        >
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
              if (!actions.order) {
                toast.error("Error initializing the order.");
                return Promise.reject("actions.order is undefined");
              }

              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: "USD",
                      value: total.toString(),
                    },
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              if (!actions.order) {
                toast.error("Error processing the payment.");
                return;
              }

              const details = await actions.order.capture();
              if (!details || !details.purchase_units) {
                toast.error("Error processing the payment.");
                return;
              }

              const orderData: IOrder = {
                idUser: formData.id,
                paymentMethod: "PayPal",
                comment: formData.comments,
                MenuItems: cartItems
                  .filter((item) => item.type === "menuItem")
                  .map((item: ICartItem) => ({
                    idMenuItem: item.id,
                    quantity: item.quantity,
                  })),
              };

              try {
                await createOrder(orderData);
                clearCart();
                toast.success("Order completed and saved successfully.");
                setIsOrderCreated(true);
              } catch {
                toast.error("There was an error placing your order.");
              }
            }}
            onError={() => toast.error("Payment rejected or error processing.")}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
};

export default OrderForm;