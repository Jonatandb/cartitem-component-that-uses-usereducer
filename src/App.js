import CartItem from "./CartItem";
import "./styles.css";

export default function App() {
  const maxPurchasePerProduct = 8;
  const products = [
    {
      id: 1,
      name: "Remera Negra",
      merchStock: [
        {
          id: 1,
          name: "Small",
          remaining: 10,
          threshold: 5,
          isUnlimitedStock: false
        },
        {
          id: 2,
          name: "Medium",
          remaining: 2,
          threshold: 5,
          isUnlimitedStock: false
        },
        {
          id: 3,
          name: "Large",
          remaining: 5,
          threshold: 5,
          isUnlimitedStock: false
        },
        {
          id: 4,
          name: "X-Large",
          remaining: 0,
          threshold: 5,
          isUnlimitedStock: false
        }
      ],
      priceId: 1,
      price: 100,
      merchCategory: {
        categoryTaxjarId: 0
      },
      applePayOnly: false,
      shippingRequired: false
    },
    {
      id: 2,
      name: "Gorrita Roja",
      merchStock: [
        {
          id: 1,
          name: "Talle único",
          remaining: 10,
          threshold: 5,
          isUnlimitedStock: false
        }
      ],
      priceId: 2,
      price: 200,
      merchCategory: {
        categoryTaxjarId: 0
      },
      applePayOnly: false,
      shippingRequired: false
    },
    {
      id: 3,
      name: "Máscara",
      merchStock: [
        {
          id: 1,
          name: "Talle único",
          remaining: 3,
          threshold: 5,
          isUnlimitedStock: false
        }
      ],
      priceId: 3,
      price: 300,
      merchCategory: {
        categoryTaxjarId: 0
      },
      applePayOnly: false,
      shippingRequired: false
    },
    {
      id: 4,
      name: "Pantalón incomprable",
      merchStock: [
        {
          id: 1,
          name: "Talle único",
          remaining: 0,
          threshold: 5,
          isUnlimitedStock: false
        }
      ],
      priceId: 4,
      price: 400,
      merchCategory: {
        categoryTaxjarId: 0
      },
      applePayOnly: false,
      shippingRequired: false
    }
  ];

  return (
    <>
      <div className="App">
        <h1>CartItem Component using useReducer() - Live Demo </h1>
        <h2>
          by{" "}
          <a
            href="http://www.github.com/Jonatandb"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jonatandb
            <span role="img" aria-label="Jonatandb happy with sunglasses">
              😎
            </span>
          </a>
        </h2>
      </div>
      {products.map((product) => (
        <CartItem
          key={product.id}
          product={product}
          maxPurchasePerProduct={maxPurchasePerProduct}
        />
      ))}
    </>
  );
}
