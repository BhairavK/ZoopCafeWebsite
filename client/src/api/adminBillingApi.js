import { apiFetch } from "./apiClient";


// =====================================================
// BILLING MENU
// =====================================================

export const getBillingMenu = async () => {
  const response = await apiFetch(
    "/admin/billing/menu"
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
        "Failed to fetch billing menu"
    );
  }

  return data.data || [];
};


// =====================================================
// TABLES
// =====================================================

export const getBillingTables = async () => {
  const response = await apiFetch(
    "/admin/billing/tables"
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
        "Failed to fetch tables"
    );
  }

  return data.data || [];
};


// =====================================================
// GET OPEN BILL
// =====================================================

export const getTableBill = async (tableId) => {
  const response = await apiFetch(
    `/admin/billing/tables/${tableId}/bill`
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
        "Failed to fetch table bill"
    );
  }

  return data.data;
};


// =====================================================
// ADD ITEM
// =====================================================

export const addBillingItem = async (
  tableId,
  menuItemVariantId,
  quantity = 1
) => {
  const response = await apiFetch(
    `/admin/billing/tables/${tableId}/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        menuItemVariantId,
        quantity,
      }),
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
        "Failed to add item"
    );
  }

  return data.data;
};


// =====================================================
// UPDATE BILL ITEM
// =====================================================

export const updateBillingItem = async (
  itemId,
  quantity
) => {
  const response = await apiFetch(
    `/admin/billing/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
      }),
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
        "Failed to update bill item"
    );
  }

  return data.data;
};


// =====================================================
// REMOVE BILL ITEM
// =====================================================

export const removeBillingItem = async (
  itemId
) => {
  const response = await apiFetch(
    `/admin/billing/items/${itemId}`,
    {
      method: "DELETE",
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
        "Failed to remove bill item"
    );
  }

  return data.data;
};


// =====================================================
// PAY BILL
// =====================================================

export const payTableBill = async (
  tableId
) => {
  const response = await apiFetch(
    `/admin/billing/tables/${tableId}/pay`,
    {
      method: "POST",
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
        "Failed to pay bill"
    );
  }

  return data.data;
};