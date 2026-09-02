import { Request, Response } from "express";
import config from "../../../config";
import { PaymentService } from "./payment.service";
import catchAsync from "../../shared/catchAsync";
import { stripe } from "../../helpers/stripe";
import sendResponse from "../../shared/sendResponse";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = config.webhookSecret as string;

    if (!webhookSecret) {
      console.error("⚠️ Stripe webhook secret not configured");

      return res.status(500).send("Webhook secret not configured");
    }

    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        req.body,
        sig,
        webhookSecret,
      );
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);

      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      const result = await PaymentService.handleStripeWebhookEvent(event);

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Webhook processed successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("❌ Error processing webhook:", error);

      // Return 500 so Stripe can retry the webhook.
      return sendResponse(res, {
        statusCode: 500,
        success: false,
        message: "Webhook processing failed",
        data: {
          error: error.message,
        },
      });
    }
  },
);

export const PaymentController = {
  handleStripeWebhookEvent,
};

// import { Request, Response } from "express";
// import catchAsync from "../../shared/catchAsync";
// import sendResponse from "../../shared/sendResponse";
// import { stripe } from "../../helpers/stripe";
// import { PaymentService } from "./payment.service";
// import config from "../../../config";

// const handleStripeWebhookEvent = async (req: Request, res: Response) => {
//   const sig = req.headers["stripe-signature"] as string;

//   let event;

//   try {
//     event = await stripe.webhooks.constructEventAsync(
//       req.body,
//       sig,
//       config.webhookSecret as string,
//     );
//   } catch (err: any) {
//     console.log(err.message);

//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   await PaymentService.handleStripeWebhookEvent(event);

//   res.status(200).json({
//     received: true,
//   });
// };

// export const PaymentController = {
//   handleStripeWebhookEvent,
// };
