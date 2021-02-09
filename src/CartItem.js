import React, { useCallback, useEffect, useReducer, useState } from "react";

import TextTransition, { presets } from "react-text-transition";

const ACTIONS = {
  SELECT_CHANGED: "SELECT_CHANGED",
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT"
};

const reducer = (state, action) => {
  // ESTRUCTURA DEL STATE:
  //
  // state = {
  //   maxPurchasePerProduct: int
  //   totalQuantitySelected: int   // Suma de cantidades selecciondas entre todos los combos, usado para establecer límites de opciones que aparecerán en los demás combos.
  //   sizes: [                     // array de objetos "talle"
  //     {
  //       sizeId:            int,
  //       selectedQuantity:  int,
  //       limit:             int(maxPurchasePerProduct),
  //       remaining:         int,
  //       threshold:         int,
  //       sizeName:          string
  //     },
  //     ...
  //   ]
  // }

  switch (action.type) {
    case ACTIONS.SELECT_CHANGED: {
      // ID DEL TALLE MODIFICADO:
      const selectedSizeId = action.payload.sizeItem.id;
      // VALOR SELECIONADO EN EL COMBO DEL TALLE MODIFICADO:
      const selectedSizeValue = parseInt(action.payload.selectedValue, 10);
      // console.log(
      //   `Talle -> ${
      //     state.sizes.find((s) => s.sizeId === selectedSizeId).sizeName
      //   } \tId -> ${selectedSizeId} \t Cantidad -> ${selectedSizeValue}`
      // );

      // Actualizo cantidad al sizeItem (TALLE) que modificaron:
      // ------------------------------------------------------
      //    - Creo un clone:  // Con {...} no me funcionaba, seguía siendo una referencia!! :-s (o del sueño hice algo mal)😁
      let sizeToUpdate = Object.assign(
        {},
        state.sizes.find((size) => size.sizeId === selectedSizeId)
      );

      // console.log("Talle a modificar:", sizeToUpdate);

      // Comparo el valor viejo con el nuevo de la selección realizada, para saber si agregaron o quitaron
      let newTotalQuantitySelected;
      let diff;
      if (selectedSizeValue > sizeToUpdate.selectedQuantity) {
        // aumentaron la demanda
        diff = Math.abs(selectedSizeValue - sizeToUpdate.selectedQuantity);
        newTotalQuantitySelected = state.totalQuantitySelected + diff;
        // console.log("Incrementaron la cantidad (OK)");
      }

      if (selectedSizeValue < sizeToUpdate.selectedQuantity) {
        // disminuyeron la demanda
        diff = Math.abs(selectedSizeValue - sizeToUpdate.selectedQuantity);
        newTotalQuantitySelected = state.totalQuantitySelected - diff;
        // console.log("Disminuyeron la cantidad (VERIFICAR)");
      }

      if (selectedSizeValue === sizeToUpdate.selectedQuantity) {
        // No modificar la demanda
        newTotalQuantitySelected = state.totalQuantitySelected;
        console.warn("No modificaron la cantidad"); // Creo que no debería pasar nunca por acá
      }

      // console.log("Nuevo total seleccionado:", newTotalQuantitySelected);

      if (newTotalQuantitySelected > state.maxPurchasePerProduct) {
        console.error(
          "\n\n***** El nuevo total va a ser mayor del permitido!!!"
        );
        // hotfix:
        // if (newTotalQuantitySelected >= state.maxPurchasePerProduct) {
        //   newTotalQuantitySelected = state.maxPurchasePerProduct;
        // }
      } else if (newTotalQuantitySelected < 0) {
        console.error("\n\n***** El nuevo total va a ser menor que cero!!!");
        // hotfix:
        // newTotalQuantitySelected = 0;
      }

      // Clono el state
      let newState = Object.assign({}, state);
      newState.sizes = [];

      // Actualizo en el nuevo state la nueva selección realizada
      sizeToUpdate.selectedQuantity = selectedSizeValue;

      // Actualizo en el nuevo state la cantidad de productos seleccionados
      newState.totalQuantitySelected = newTotalQuantitySelected;

      // Clono todos talles
      newState.sizes = state.sizes.map((sizeItem) =>
        Object.assign({}, sizeItem)
      );

      // Descarto el clon del que están modificando
      newState.sizes = newState.sizes.filter(
        (sizeItem) => sizeItem.sizeId !== sizeToUpdate.sizeId
      );

      // Agrego al state clonado el talle actualizado
      newState.sizes.push(sizeToUpdate);

      // Recorro los demás talles y les actualizo su límite según newTotalQuantitySelected
      newState.sizes.forEach((currentSizeItem) => {
        // console.log({
        //   "\n\n\t------ currentSizeItem.sizeId": currentSizeItem.sizeId,
        //   "sizeToUpdate.sizeId": sizeToUpdate.sizeId
        // });

        if (currentSizeItem.sizeId !== sizeToUpdate.sizeId) {
          // console.log({
          //   "\n\n**** Trabajando con sizeItem": currentSizeItem.sizeName,
          //   id: currentSizeItem.sizeId,
          //   limit: currentSizeItem.limit,
          //   remaining: currentSizeItem.remaining
          // });

          const { totalQuantitySelected, maxPurchasePerProduct } = newState;
          // console.log(
          //   "state.totalQuantitySelected:",
          //   state.totalQuantitySelected
          // );
          // console.log(
          //   "newState.totalQuantitySelected:",
          //   newState.totalQuantitySelected
          // );

          const availableAmount = maxPurchasePerProduct - totalQuantitySelected;
          // console.log("availableAmount:", availableAmount);

          let newLimit = availableAmount + currentSizeItem.selectedQuantity;

          if (newLimit > state.maxPurchasePerProduct) {
            newLimit = state.maxPurchasePerProduct;
          }

          if (newLimit >= currentSizeItem.remaining) {
            newLimit = currentSizeItem.remaining;
          } else {
            if (newLimit < currentSizeItem.selectedQuantity) {
              console.error("Si pasa por acá algo está mal calculado!");
              newLimit = currentSizeItem.selectedQuantity;
            } else {
              //newLimit >= currentSizeItem.selectedQuantity)
              // no lo tengo que actualizar al newLimit
            }
          }

          currentSizeItem.limit = newLimit;

          // console.log(
          //   "-*-*-*-* New limit for:",
          //   currentSizeItem.sizeId,
          //   " -> ",
          //   newLimit
          // );

          // console.log(
          //   "newLimit:",
          //   newLimit,
          //   "limit:",
          //   currentSizeItem.limit.toString(),
          //   "remaining:",
          //   currentSizeItem.remaining.toString()
          // );
        }
      });

      return newState;
    }
    case ACTIONS.INCREMENT:
    case ACTIONS.DECREMENT: {
      const updatedSize = { ...state.sizes[0] };
      updatedSize.selectedQuantity =
        action.type === ACTIONS.INCREMENT
          ? updatedSize.selectedQuantity + 1
          : updatedSize.selectedQuantity - 1;
      const newState = {
        ...state,
        sizes: [updatedSize],
        totalQuantitySelected: updatedSize.selectedQuantity
      };
      return newState;
    }
    default:
      return state;
  }
};

const CartItem = ({ product, maxPurchasePerProduct }) => {
  const generateInitialState = () => {
    const sizesData = product.merchStock.reduce(
      (acc, currentSize) => ({
        ...acc, // acc => { sizes: [ { sizes: [{}, {}] } ] }
        sizes: [
          ...acc["sizes"],
          {
            sizeId: currentSize.id,
            selectedQuantity:
              product.merchStock.length === 1
                ? product.merchStock[0].remaining > 0
                  ? 1
                  : 0
                : 0,
            limit:
              product.merchStock.find((ms) => ms.id === currentSize.id)
                .remaining >= maxPurchasePerProduct
                ? maxPurchasePerProduct
                : product.merchStock.find((ms) => ms.id === currentSize.id)
                    .remaining,
            remaining: currentSize.remaining,
            threshold: currentSize.threshold,
            sizeName: currentSize.name
          }
        ]
      }),
      { sizes: [] }
    );
    sizesData.maxPurchasePerProduct = maxPurchasePerProduct;
    let totalQuantitySelected = 0;
    if (product.merchStock.length === 1) {
      if (product.merchStock[0].remaining > 0) {
        totalQuantitySelected = 1;
      }
    }
    sizesData.totalQuantitySelected = totalQuantitySelected;
    return sizesData;
  };

  const [CartItemData, dispatch] = useReducer(reducer, generateInitialState());
  const [lineItems, setLineItems] = useState();

  const generateLineItems = useCallback(() => {
    const generatedLineItems = CartItemData.sizes.map((sizeItem) => {
      return {
        category: product.merchCategory.categoryTaxjarId,
        isAppleExclusive: product.applePayOnly,
        isShippingRequired: product.shippingRequired,
        isUnlimitedStock: product.merchStock.find(
          (ms) => ms.id === sizeItem.sizeId
        ).isUnlimitedStock,
        name: product.name,
        price: product.price,
        priceId: product.priceId,
        merchOptionName: product.merchStock.find(
          (ms) => ms.id === sizeItem.sizeId
        ).name,
        merchStockId: sizeItem.sizeId,
        quantity: sizeItem.selectedQuantity
      };
    });
    setLineItems(generatedLineItems);
  }, [product, CartItemData]);

  useEffect(() => {
    generateLineItems();
  }, [CartItemData, generateLineItems]);

  useEffect(() => {
    // Acá se debería llamar a useCart()
    //   -> updatedLineItems(lineItems)
    console.log(lineItems);
  }, [lineItems]);

  const getselectedQuantity = (id) => {
    const item = CartItemData.sizes.find((size) => size.sizeId === id);
    const { selectedQuantity } = item;
    return selectedQuantity;
  };

  const getLimit = (id) => {
    const item = CartItemData.sizes.find((size) => size.sizeId === id);
    const { limit } = item;
    return limit;
  };

  const getOptions = (id) => {
    const options = [];
    const limit = getLimit(id);
    for (let i = 0; i <= limit; i++) {
      const idOption = "sizeId:" + id + "-Option:" + i;
      options.push(
        <option key={idOption} value={i}>
          {i}
        </option>
      );
    }
    return options;
  };

  const handleSelectChange = (e, sizeItem) => {
    const selectedValue = e.target.options[e.target.selectedIndex].value;
    dispatch({
      type: ACTIONS.SELECT_CHANGED,
      payload: {
        sizeItem,
        selectedValue
      }
    });
  };

  const handleQuantityButtonChange = (e, SizeChanged) => {
    const actionPerformed = e.target.name;
    dispatch({
      type: actionPerformed,
      payload: {
        SizeChanged
      }
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        maxWidth: "70%",
        backgroundColor: "tomato",
        padding: "5px",
        margin: "10px auto"
      }}
    >
      <div
        style={{
          width: "50%",
          backgroundColor: "lightsteelblue",
          padding: "20px"
        }}
      >
        <h1>CartItem: {product.name}</h1>
        <p>maxPurchasePerProduct:{maxPurchasePerProduct}</p>
        <div
          style={{
            display: "flex",
            flexDirection: "row"
          }}
        >
          {product.merchStock.length === 1 ? (
            <div
              style={{
                margin: "10px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <h3>SELECT QUANTITY:</h3>
              <div
                style={{
                  margin: "10px 10px",
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                <button
                  style={{
                    margin: "10px 10px",
                    padding: "10px"
                  }}
                  name={ACTIONS.DECREMENT}
                  onClick={(e) =>
                    handleQuantityButtonChange(e, CartItemData.sizes[0])
                  }
                  disabled={CartItemData.sizes[0].selectedQuantity <= 1}
                >
                  -
                </button>
                <h3
                  style={{
                    color:
                      CartItemData.sizes[0].selectedQuantity === 0
                        ? "gray"
                        : "black"
                  }}
                >
                  {CartItemData.sizes[0].selectedQuantity}
                </h3>
                <button
                  style={{
                    margin: "10px 10px",
                    padding: "10px"
                  }}
                  name={ACTIONS.INCREMENT}
                  onClick={(e) =>
                    handleQuantityButtonChange(e, CartItemData.sizes[0])
                  }
                  disabled={
                    CartItemData.sizes[0].selectedQuantity >=
                      CartItemData.sizes[0].remaining ||
                    CartItemData.sizes[0].selectedQuantity >=
                      CartItemData.sizes[0].limit
                  }
                >
                  +
                </button>
              </div>
              {CartItemData.sizes[0].remaining === 0 ? (
                <h4 style={{ marginTop: "0" }}>Out of stock</h4>
              ) : CartItemData.sizes[0].remaining <=
                CartItemData.sizes[0].threshold ? (
                <h4 style={{ marginTop: "0" }}>Only a few left</h4>
              ) : null}
            </div>
          ) : (
            product.merchStock.map((sizeItem) => (
              <div
                key={sizeItem.id}
                style={{
                  margin: "10px 10px",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <label>{sizeItem.name}:</label>
                <select
                  style={{ marginLeft: "10px", padding: "10px" }}
                  onChange={(e) => handleSelectChange(e, sizeItem)}
                  disabled={sizeItem.remaining === 0}
                  value={getselectedQuantity(sizeItem.id)}
                >
                  {getOptions(sizeItem.id)}
                </select>
                {sizeItem.remaining === 0 ? (
                  <small>Out of stock</small>
                ) : sizeItem.remaining <= sizeItem.threshold ? (
                  <small>Only a few left</small>
                ) : null}
              </div>
            ))
          )}
        </div>
        <p>CartItem State:</p>
        <pre>
          {JSON.stringify(
            CartItemData.sizes.sort((a, b) => a.sizeId - b.sizeId) &&
              CartItemData,
            null,
            2
          )}
        </pre>
      </div>
      <div
        style={{
          width: "50%",
          backgroundColor: "lightgray",
          padding: "20px",
          animation: 'from{color:"red"}; to{color:"green"}; 2s ease'
        }}
      >
        <h3>LineItems generados para: {product.name}</h3>
        <TextTransition
          text={<pre>{JSON.stringify(CartItemData, null, 2)}</pre>}
          springConfig={
            presets.default
          } /* available presets: default, gentle, wobbly, stiff, slow, molasses */
        />
      </div>
    </div>
  );
};

export default CartItem;
