import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { stripe } from "../../helper/stripe";
import { PaymentService } from "./payment.service";
import config from "../../../config";

// const handleStripeWebhookEvent = catchAsync(
//   async (req: Request, res: Response) => {
//     const sig = req.headers["stripe-signature"] as string;
//     const webhookSecret = config.webhookSecret as string;

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//     } catch (err: any) {
//       console.error("⚠️ Webhook signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
//     const result = await PaymentService.handleStripeWebhookEvent(event);

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Webhook req send successfully",
//       data: result,
//     });
//   },
// );

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      req.body,
      sig,
      config.webhookSecret as string,
    );
  } catch (err: any) {
    console.log(err.message);

    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await PaymentService.handleStripeWebhookEvent(event);

  res.status(200).json({
    received: true,
  });
};

export const PaymentController = {
  handleStripeWebhookEvent,
};
