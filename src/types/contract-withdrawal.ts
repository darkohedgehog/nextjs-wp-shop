export type WithdrawalScope = "order" | "items";

export type WithdrawalItem = {
  item_id: number;
  product_id: number;
  name: string;
  quantity: number;
};

export type WithdrawalVerifiedOrder = {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  customer_email_masked: string;
  customer_name: string;
  withdrawal_requested: boolean;
  withdrawal_request_id: string;
  window_days: number;
  items: WithdrawalItem[];
};

export type VerifyTokenRequest = {
  token: string;
};

export type VerifyTokenResponse =
  | {
      ok: true;
      order: WithdrawalVerifiedOrder;
    }
  | WithdrawalApiError;

export type RequestLinkRequest = {
  order_number: string;
  email: string;
};

export type RequestLinkResponse =
  | {
      ok: true;
      message: string;
    }
  | WithdrawalApiError;

export type SubmitWithdrawalRequest = {
  token: string;
  scope: WithdrawalScope;
  item_ids: number[];
  comment: string;
  confirmed: boolean;
};

export type SubmitWithdrawalResponse =
  | {
      ok: true;
      request_id: string;
      submitted_at: string;
      customer_email_masked: string;
    }
  | WithdrawalApiError;

export type LinkWithdrawalRequest = {
  order_id: number;
  order_key: string;
};

export type LinkWithdrawalResponse =
  | {
      ok: true;
      withdrawal_url: string;
    }
  | WithdrawalApiError;

export type WithdrawalApiError = {
  ok: false;
  error: string;
  message?: string;
};
