import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext =
  createContext(null);

const CART_STORAGE_KEY =
  "zoop_cafe_cart";

/*
 * -----------------------------------------
 * LOAD CART
 * -----------------------------------------
 */

const loadCart = () => {
  try {
    const saved =
      localStorage.getItem(
        CART_STORAGE_KEY
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Failed to load cart:",
      error
    );

    return [];
  }
};

/*
 * -----------------------------------------
 * NORMALIZE CHOICES
 * -----------------------------------------
 *
 * Important:
 *
 * optionIds can contain duplicates.
 *
 * Example:
 *
 * [
 *   "blue-mojito",
 *   "blue-mojito"
 * ]
 *
 * Sorting preserves the duplicate.
 */

const normalizeChoices = (
  choices = []
) => {
  return [...choices]
    .map((choice) => ({
      choiceGroupId:
        choice.choiceGroupId,

      optionIds: [
        ...(choice.optionIds || []),
      ].sort(),
    }))
    .sort((a, b) =>
      String(
        a.choiceGroupId
      ).localeCompare(
        String(b.choiceGroupId)
      )
    );
};

/*
 * -----------------------------------------
 * CART ITEM ID
 * -----------------------------------------
 */

const createCartItemId = (
  variantId,
  choices = []
) => {
  const normalizedChoices =
    normalizeChoices(
      choices
    );

  return JSON.stringify({
    variantId,
    choices:
      normalizedChoices,
  });
};

/*
 * -----------------------------------------
 * PROVIDER
 * -----------------------------------------
 */

export function CartProvider({
  children,
}) {
  const [items, setItems] =
    useState(loadCart);

  /*
   * Save cart whenever it changes.
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [items]);

  /*
   * ---------------------------------------
   * ADD TO CART
   * ---------------------------------------
   */

  const addToCart = (item) => {
    setItems((currentItems) => {
      const cartItemId =
        createCartItemId(
          item.variantId,
          item.choices || []
        );

      const existingIndex =
        currentItems.findIndex(
          (cartItem) =>
            cartItem.cartItemId ===
            cartItemId
        );

      /*
       * Same product + same variant +
       * same combo choices:
       *
       * merge quantities.
       */

      if (
        existingIndex !== -1
      ) {
        return currentItems.map(
          (cartItem, index) => {
            if (
              index !==
              existingIndex
            ) {
              return cartItem;
            }

            return {
              ...cartItem,

              quantity: Math.min(
                100,
                Number(
                  cartItem.quantity
                ) +
                  Number(
                    item.quantity ||
                      1
                  )
              ),
            };
          }
        );
      }

      /*
       * New cart item.
       */

      return [
        ...currentItems,
        {
          ...item,

          cartItemId,

          quantity: Math.min(
            100,
            Math.max(
              1,
              Number(
                item.quantity ||
                  1
              )
            )
          ),

          choices:
            normalizeChoices(
              item.choices || []
            ),
        },
      ];
    });
  };

  /*
   * ---------------------------------------
   * UPDATE QUANTITY
   * ---------------------------------------
   */

  const updateQuantity = (
    cartItemId,
    quantity
  ) => {
    const nextQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        nextQuantity
      )
    ) {
      return;
    }

    if (
      nextQuantity <= 0
    ) {
      setItems(
        (currentItems) =>
          currentItems.filter(
            (item) =>
              item.cartItemId !==
              cartItemId
          )
      );

      return;
    }

    setItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.cartItemId ===
            cartItemId
              ? {
                  ...item,
                  quantity:
                    Math.min(
                      100,
                      nextQuantity
                    ),
                }
              : item
        )
    );
  };

  /*
   * ---------------------------------------
   * REMOVE
   * ---------------------------------------
   */

  const removeFromCart = (
    cartItemId
  ) => {
    setItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.cartItemId !==
            cartItemId
        )
    );
  };

  /*
   * ---------------------------------------
   * CLEAR
   * ---------------------------------------
   */

  const clearCart = () => {
    setItems([]);
  };

  /*
   * ---------------------------------------
   * ITEM COUNT
   * ---------------------------------------
   */

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      ),
    [items]
  );

  /*
   * ---------------------------------------
   * CART TOTAL
   * ---------------------------------------
   */

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(
            item.unitPrice || 0
          ) *
            Number(
              item.quantity || 0
            ),
        0
      ),
    [items]
  );

  /*
   * ---------------------------------------
   * CONTEXT VALUE
   * ---------------------------------------
   */

  const value = {
    items,
    itemCount,
    cartTotal,

    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,

    createCartItemId,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
 * -----------------------------------------
 * HOOK
 * -----------------------------------------
 */

export const useCart = () => {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};