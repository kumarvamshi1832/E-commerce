import { useEffect, useRef, useState } from "react";
import "./ChatBot.css";

function ChatBot() {
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");


  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
    sender: "bot",
    text: "Hi! 👋 Welcome to our store. How can I help you today?",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },

  ]);

  // =========================
  // GET BOT RESPONSE
  // =========================
  const getBotResponse = (userMessage) => {
  const messageText = userMessage.toLowerCase().trim();

  // GREETINGS
if (
  messageText === "hi" ||
  messageText === "hello" ||
  messageText === "hey" ||
  messageText === "hi there" ||
  messageText === "hello there"
) {
  return "Hi! 👋 How can I help you today? You can ask me about orders, payments, delivery, refunds, login, cart, wishlist, or anything related to our store.";
}

// GOOD MORNING / AFTERNOON / EVENING
if (
  messageText === "good morning" ||
  messageText === "good afternoon" ||
  messageText === "good evening"
) {
  return "Hello! 😊 Hope you're having a great day. How can I help you with your order or shopping experience?";
}

// THANK YOU
if (
  messageText === "thanks" ||
  messageText === "thank you" ||
  messageText === "thanks a lot" ||
  messageText === "thank you so much"
) {
  return "You're very welcome! 😊 I'm happy to help. If you have any other questions, feel free to ask.";
}

// BYE
if (
  messageText === "bye" ||
  messageText === "goodbye" ||
  messageText === "see you"
) {
  return "Goodbye! 👋 Thank you for visiting our store. Have a great day! 😊";
}

  // =========================
  // CANCEL ORDER - PRIORITY 1
  // =========================
  if (
    messageText.includes("cancel") ||
    messageText.includes("cancellation")
  ) {
    return "You can cancel an eligible order from the My Orders section by opening the order and selecting the Cancel Order option.";
  }

  // =========================
  // PAYMENT - PRIORITY 2
  // =========================
  if (
    messageText.includes("payment") ||
    messageText.includes("transaction") ||
    messageText.includes("payment failed") ||
    messageText.includes("payment didn't work") ||
    messageText.includes("payment did not work") ||
    messageText.includes("money deducted") ||
    messageText.includes("amount deducted") ||
    messageText.includes("transaction failed")
  ) {
    return "If your payment failed, please check your payment details and try again. If money was deducted but your order was not created, please contact our support team.";
  }

  // =========================
  // REFUND - PRIORITY 3
  // =========================
  if (
    messageText.includes("refund") ||
    messageText.includes("money back") ||
    messageText.includes("want my money") ||
    messageText.includes("get my money back")
  ) {
    return "For refund-related issues, please provide your Order ID and our support team will help you with the refund process.";
  }

  // =========================
  // PASSWORD - PRIORITY 4
  // =========================
  if (
    messageText.includes("forgot password") ||
    messageText.includes("reset password") ||
    messageText.includes("password") ||
    messageText.includes("forgot my password")
  ) {
    return "If you've forgotten your password, use the Forgot Password option and follow the instructions to reset your password.";
  }

  // =========================
  // LOGIN
  // =========================
  if (
    messageText.includes("login") ||
    messageText.includes("log in") ||
    messageText.includes("sign in") ||
    messageText.includes("signin") ||
    messageText.includes("cannot login") ||
    messageText.includes("can't login") ||
    messageText.includes("cannot log in") ||
    messageText.includes("can't log in") ||
    messageText.includes("unable to login") ||
    messageText.includes("unable to log in") ||
    messageText.includes("unable to sign in")
  ) {
    return "If you're having trouble logging in, please check your registered email and password. If you forgot your password, use the Forgot Password option to reset it.";
  }

  // =========================
  // SIGNUP / REGISTRATION
  // =========================
  if (
    messageText.includes("signup") ||
    messageText.includes("sign up") ||
    messageText.includes("register") ||
    messageText.includes("registration") ||
    messageText.includes("create account") ||
    messageText.includes("create an account")
  ) {
    return "To create an account, go to the Signup page and enter your required details. Make sure you provide a valid email address.";
  }

  // DELIVERY / SHIPPING
if (
  messageText.includes("delivery") ||
  messageText.includes("shipping") ||
  messageText.includes("deliver") ||
  messageText.includes("package") ||
  messageText.includes("arrive") ||
  messageText.includes("received") ||
  messageText.includes("on the way") ||
  messageText.includes("where is my package") ||
  messageText.includes("when will it arrive") ||
  messageText.includes("when will my order arrive")
) {
  return "You can check your order status from the My Orders section. Delivery time may vary depending on your location.";
}

// ORDER STATUS
if (
  messageText.includes("order status") ||
  messageText.includes("where is my order") ||
  messageText.includes("track my order") ||
  messageText.includes("track order") ||
  messageText.includes("check my order") ||
  messageText.includes("order tracking") ||
  messageText.includes("order update")
) {
  return "You can view your order status and details from the My Orders section of your account.";
}

// GENERAL ORDER
if (
  messageText.includes("order") ||
  messageText.includes("my orders")
) {
  return "You can view your orders and their status from the My Orders section of your account.";
}
 // CART PROBLEM
if (
  messageText.includes("cart") &&
  (
    messageText.includes("empty") ||
    messageText.includes("can't add") ||
    messageText.includes("cannot add") ||
    messageText.includes("unable to add") ||
    messageText.includes("not adding") ||
    messageText.includes("not showing")
  )
) {
  return "If you're unable to add a product to your cart, please make sure the product is in stock and try again. If the item still doesn't appear in your cart, please refresh the page and try again.";
}

// REMOVE FROM CART
if (
  messageText.includes("remove") &&
  messageText.includes("cart")
) {
  return "To remove a product from your cart, open the Cart section and click the Remove button next to the product.";
}

// ADD TO CART
if (
  messageText.includes("add") &&
  messageText.includes("cart")
) {
  return "To add a product to your cart, open the Products page, select the product you want, and click Add to Cart.";
}

// GENERAL CART
if (
  messageText.includes("cart") ||
  messageText.includes("shopping cart")
) {
  return "You can add products to your cart from the Products page. You can also increase, decrease, or remove items from your Cart.";
}

  // WISHLIST PROBLEM
if (
  messageText.includes("wishlist") &&
  (
    messageText.includes("can't add") ||
    messageText.includes("cannot add") ||
    messageText.includes("unable to add") ||
    messageText.includes("not adding") ||
    messageText.includes("not working")
  )
) {
  return "If you're unable to add a product to your Wishlist, please make sure you're logged in and try clicking the heart icon again.";
}

// REMOVE FROM WISHLIST
if (
  messageText.includes("remove") &&
  (
    messageText.includes("wishlist") ||
    messageText.includes("saved product") ||
    messageText.includes("favorite") ||
    messageText.includes("favourite")
  )
) {
  return "To remove a product from your Wishlist, open the Wishlist section and click the Remove button for that product.";
}

// ADD TO WISHLIST
if (
  (
    messageText.includes("add") ||
    messageText.includes("save")
  ) &&
  (
    messageText.includes("wishlist") ||
    messageText.includes("favorite") ||
    messageText.includes("favourite")
  )
) {
  return "To add a product to your Wishlist, open the product and click the heart icon. You can view your saved products from the Wishlist section.";
}

// GENERAL WISHLIST
if (
  messageText.includes("wishlist") ||
  messageText.includes("favorite") ||
  messageText.includes("favourite") ||
  messageText.includes("saved products")
) {
  return "You can add products to your Wishlist using the heart icon on the product page. Your saved products can be viewed from the Wishlist section.";
}

  // COUPON / DISCOUNT ISSUE
if (
  messageText.includes("coupon") &&
  (
    messageText.includes("not working") ||
    messageText.includes("doesn't work") ||
    messageText.includes("does not work") ||
    messageText.includes("invalid") ||
    messageText.includes("failed") ||
    messageText.includes("not applying")
  )
) {
  return "If your coupon isn't working, please check that the code is entered correctly and that the coupon hasn't expired or reached its usage limit.";
}

// DISCOUNT ISSUE
if (
  messageText.includes("discount") &&
  (
    messageText.includes("not applying") ||
    messageText.includes("not working") ||
    messageText.includes("didn't get") ||
    messageText.includes("not received")
  )
) {
  return "If your discount isn't being applied, please check that the coupon is valid and that your order meets the coupon requirements.";
}

// GENERAL COUPON / DISCOUNT
if (
  messageText.includes("coupon") ||
  messageText.includes("discount") ||
  messageText.includes("promo") ||
  messageText.includes("promo code")
) {
  return "If you have a valid coupon, you can apply it during checkout to receive the applicable discount.";
}

 // STOCK PROBLEM
if (
  (
    messageText.includes("stock") ||
    messageText.includes("available") ||
    messageText.includes("availability")
  ) &&
  (
    messageText.includes("out of stock") ||
    messageText.includes("not available") ||
    messageText.includes("unavailable") ||
    messageText.includes("not in stock") ||
    messageText.includes("sold out")
  )
) {
  return "This product may currently be out of stock. Please check the product page for the latest stock availability. You can also try again later if the product becomes available.";
}

// CHECK STOCK / AVAILABILITY
if (
  messageText.includes("in stock") ||
  messageText.includes("available") ||
  messageText.includes("availability") ||
  messageText.includes("stock")
) {
  return "You can check the current stock availability of a product by opening its product details page.";
}

// PRODUCT DETAILS
if (
  messageText.includes("product details") ||
  messageText.includes("product information") ||
  messageText.includes("tell me about this product") ||
  messageText.includes("more information about the product")
) {
  return "Open the product from the Products page to view its details, price, stock availability, and other information.";
}

// PRODUCT PRICE
if (
  messageText.includes("product price") ||
  messageText.includes("price of the product") ||
  messageText.includes("how much is this product") ||
  messageText.includes("how much does this product cost")
) {
  return "You can view the current price of a product on its product details page.";
}

// GENERAL PRODUCT
if (
  messageText.includes("product") ||
  messageText.includes("products") ||
  messageText.includes("item")
) {
  return "You can browse all available products from the Products page. Select a product to view its details, price, stock, and other information.";
}

  // =========================
  // FALLBACK
  // =========================
  return "Sorry, we couldn't find a solution for your issue. Our support team will look into your issue and try to resolve it as soon as possible. Thank you for your patience! 🙏";
};


  //quick reply

  const sendQuickMessage = (quickMessage) => {
  const userMessage = {
    sender: "user",
    text: quickMessage,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  setMessages((previousMessages) => [
    ...previousMessages,
    userMessage,
  ]);

  setIsTyping(true);

  setTimeout(() => {
    const botMessage = {
      sender: "bot",
      text: getBotResponse(quickMessage),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      botMessage,
    ]);

    setIsTyping(false);
  }, 800);
};

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = () => {
    const trimmedMessage = message.trim();

    // Don't send empty message
    if (!trimmedMessage) {
      return;
    }

    // Add user message
    const userMessage = {
  sender: "user",
  text: trimmedMessage,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    // Clear input
    setMessage("");

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage = {
  sender: "bot",
  text: getBotResponse(trimmedMessage),
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

      setMessages((previousMessages) => [
        ...previousMessages,
        botMessage,
      ]);

      // Hide typing indicator
      setIsTyping(false);
    }, 800);
  };

  // =========================
  // ENTER KEY
  // =========================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // =========================
  // JSX
  // =========================
  return (
    <>
      {/* Floating Chat Button */}
      <button
        type="button"
        className="chatbot-button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="Open customer support"
      >
        🤖
      </button>

      

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">

          {/* Header */}
          <div className="chatbot-header">
            <div>
              <h3>Customer Support</h3>
              <span>We're here to help</span>
            </div>

            <button
  type="button"
  className="chatbot-clear"
  onClick={() => {
    setMessages([
      {
        sender: "bot",
        text: "Hi! 👋 Welcome to our store. How can I help you today?",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }}
>
  Clear
</button>

            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close customer support"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? "user-message"
                    : "bot-message"
                }
              >
                {msg.sender === "bot" && (
                  <strong>🤖 Support</strong>
                )}

                <p>{msg.text}</p>
                <span className="message-time">{msg.time}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="bot-message typing-message">
                <strong>🤖 Support</strong>
                <p>Typing...</p>
              </div>
            )}

            {!isTyping && (
  <div className="quick-replies">
    <button
      type="button"
      onClick={() => sendQuickMessage("Order Status")}
    >
      Order Status
    </button>

    <button
      type="button"
      onClick={() => sendQuickMessage("Cancel Order")}
    >
      Cancel Order
    </button>

    <button
      type="button"
      onClick={() => sendQuickMessage("Payment Issue")}
    >
      Payment Issue
    </button>

    <button
      type="button"
      onClick={() => sendQuickMessage("Refund")}
    >
      Refund
    </button>

    <button
      type="button"
      onClick={() => sendQuickMessage("Login Help")}
    >
      Login Help
    </button>
  </div>
)}

            {/* Scroll Reference */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Describe your problem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              onClick={sendMessage}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
