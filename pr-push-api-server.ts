import clientPromise from "../mongodb";
import { SaveSubscriptionReq, SaveSubscriptionResp } from "../pr-push-api-common/types";
import { ApiResp } from "../user-management-server/user-management-common/apiRoutesCommon";
import { SubscriptionDoc } from "./types";
import webpush, { WebPushError } from 'web-push';



const vapidKeysStr = process.env.VAPID_KEYS;
if (!vapidKeysStr) {
    throw new Error('Invalid/Missing environment variable: "VAPID_KEYS"');
}

console.log('found VAPID_KEY IN ENV', vapidKeysStr);

const vapidKeys = JSON.parse(vapidKeysStr);

webpush.setVapidDetails(
    'mailto:peter.reitinger@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
)



export const exampleExecuteSaveSubscription = (dbName: string, collectionName: string) => async (req: SaveSubscriptionReq): Promise<ApiResp<SaveSubscriptionResp>> => {
    const client = await clientPromise;
    const db = client.db(dbName);
    const doc: SubscriptionDoc = {
        _id: 0,
        stringifiedSubscription: req.stringifiedSubscription
    }
    try {
        const res = await db.collection<SubscriptionDoc>(collectionName).updateOne(
            {
                _id: 0
            }, {
            $set: doc
        }, {
            upsert: true
        });
        if (!res.acknowledged) {
            console.error('insert not acknowledged');
            return {
                type: 'error',
                error: 'not acknowledged'
            }
        }

        return {
            type: 'success'
        }

    } catch (reason) {
        console.error(reason);
        return {
            type: 'error',
            error: JSON.stringify(reason)
        }
    }
}

/**
 * more a documentation which function of webpush to use than a real
 * benefit because it just wraps webpush.sendNotification in the lib web-push.
 * @param subscription 
 * @param msg 
 * @returns 
 */
export const sendPushMessage = async<Message> (subscription: webpush.PushSubscription, msg: Message): Promise<webpush.SendResult> => {
    try {
        const sendRes: webpush.SendResult = await webpush.sendNotification(subscription, JSON.stringify(msg));
        return sendRes;
    } catch (reason) {
        const e = reason as webpush.WebPushError;
        throw e;
    }
}
