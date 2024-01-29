export interface SubscriptionDoc {
    _id: number;
    stringifiedSubscription: string;
}

export type ExecuteSaveSubscription = (
    (req: SaveSubscriptionReq) => Promise<ApiResp<SaveSubscriptionResp>>
);
