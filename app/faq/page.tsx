import { Button } from "@/components/ui/button"
import type { Metadata } from "next"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "FAQ - VERA's Store",
  description: "Frequently asked questions about VERA's Store",
}

const faqs = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business days delivery. International shipping may take 10-15 business days depending on your location.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes! We offer free standard shipping on all orders over $50 within the continental United States. Express shipping rates apply for expedited delivery.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Once your order ships, you'll receive a tracking number via email. You can also view your order status and tracking information in your account under 'Orders'.",
      },
      {
        question: "Can I change or cancel my order?",
        answer:
          "You can modify or cancel your order within 1 hour of placing it. After that, the order moves to processing and cannot be changed. Please contact our support team immediately if you need assistance.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some items like personalized products or final sale items are not eligible for return.",
      },
      {
        question: "How do I initiate a return?",
        answer:
          "Log into your account, go to 'Orders', select the order you want to return, and click 'Request Return'. Follow the instructions to print a return label and ship the item back to us.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Once we receive and inspect your returned item, we'll process your refund within 5-7 business days. The refund will be credited to your original payment method.",
      },
    ],
  },
  {
    category: "Payment & Security",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit and debit cards through our secure Paystack payment gateway. Your payment information is encrypted and never stored on our servers.",
      },
      {
        question: "Is it safe to use my credit card on your site?",
        answer:
          "Yes, absolutely! We use industry-standard SSL encryption and process all payments through Paystack, a PCI-DSS compliant payment processor. Your financial information is completely secure.",
      },
      {
        question: "Do you store my payment information?",
        answer:
          "No, we do not store any payment card information on our servers. All payment processing is handled securely by Paystack.",
      },
    ],
  },
  {
    category: "Account & Privacy",
    questions: [
      {
        question: "Do I need an account to make a purchase?",
        answer:
          "Yes, you need to create an account to place an order. This allows you to track orders, save addresses, maintain a wishlist, and enjoy a personalized shopping experience.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "Click 'Login' in the header, then click 'Forgot Password'. Enter your email address and we'll send you a link to reset your password.",
      },
      {
        question: "How is my personal information protected?",
        answer:
          "We take your privacy seriously. Your personal information is encrypted, stored securely, and never shared with third parties without your consent. Please review our Privacy Policy for more details.",
      },
    ],
  },
  {
    category: "Products",
    questions: [
      {
        question: "Are your products authentic?",
        answer:
          "Yes, all products sold on VERA's Store are 100% authentic. We source directly from manufacturers and authorized distributors to guarantee product quality and authenticity.",
      },
      {
        question: "Do you restock sold-out items?",
        answer:
          "We regularly restock popular items. You can sign up for email notifications on product pages to be alerted when out-of-stock items become available again.",
      },
      {
        question: "Can I pre-order upcoming products?",
        answer:
          "Yes, when available, pre-orders will be clearly marked on product pages. Pre-order items typically ship on or before the release date specified.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Find answers to common questions about shopping at VERA's Store. Can't find what you're looking for? Contact
          our support team.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((section, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{section.category}</CardTitle>
              <CardDescription>Common questions about {section.category.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((faq, qIdx) => (
                  <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Still have questions?</CardTitle>
          <CardDescription>Our support team is here to help</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you couldn't find the answer you were looking for, please don't hesitate to reach out to our customer
            support team.
          </p>
          <Button asChild>
            <a href="/contact">Contact Support</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
