/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Billing page. Shows current plan, usage, and upgrade/downgrade options.
 * Feature-flagged behind `isStripeEnabled` — when Stripe is not configured,
 * shows the billing plans with a "Stripe not configured" message.
 *
 * When Stripe is enabled, this page would also show:
 *  - Current subscription status
 *  - Payment method
 *  - Invoice history
 *  - Usage-based billing (if applicable)
 */
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isStripeEnabled } from "@/lib/env";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, AlertCircle, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "1 AI bot",
      "100 conversations / month",
      "1,000 messages / month",
      "Basic analytics",
      "Community support",
    ],
    limits: { bots: 1, conversations: 100, messages: 1000 },
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    popular: true,
    features: [
      "10 AI bots",
      "5,000 conversations / month",
      "50,000 messages / month",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Priority support",
    ],
    limits: { bots: 10, conversations: 5000, messages: 50000 },
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited bots",
      "Unlimited conversations",
      "Unlimited messages",
      "White-label",
      "SSO / SAML",
      "SLA guarantee",
      "Dedicated support",
      "Custom integrations",
    ],
    limits: { bots: Infinity, conversations: Infinity, messages: Infinity },
  },
];

export default async function BillingPage() {
  const session = await requireSession();

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspaceId! },
    include: {
      bots: {
        select: {
          _count: { select: { conversations: true } },
        },
      },
    },
  });

  if (!workspace) return null;

  // Conversation total is aggregated across the workspace's bots.
  const conversationCount = workspace.bots.reduce(
    (sum, b) => sum + b._count.conversations,
    0,
  );

  const currentPlan = plans.find((p) => p.name.toLowerCase() === workspace.plan.toLowerCase()) ?? plans[0]!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and usage.
          </p>
        </div>
        {!isStripeEnabled && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Stripe not configured
          </Badge>
        )}
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{currentPlan.name}</span>
                <Badge variant={currentPlan.name === "Free" ? "secondary" : "default"}>
                  {workspace.plan}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentPlan.price}{currentPlan.period}
              </p>
            </div>
            {currentPlan.name !== "Enterprise" && (
              <Button disabled={!isStripeEnabled}>
                <Zap className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage This Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Bots</p>
              <p className="text-lg font-semibold">
                {workspace.bots.length}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {currentPlan.limits.bots === Infinity ? "∞" : currentPlan.limits.bots}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversations</p>
              <p className="text-lg font-semibold">
                {conversationCount}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {currentPlan.limits.conversations === Infinity ? "∞" : currentPlan.limits.conversations}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <p className="text-lg font-semibold">
                —
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {currentPlan.limits.messages === Infinity ? "∞" : currentPlan.limits.messages}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Tracked via usage records
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === workspace.plan.toLowerCase();
          return (
            <Card
              key={plan.name}
              className={plan.popular ? "border-primary shadow-md" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.popular && <Badge>Most Popular</Badge>}
                  {isCurrent && <Badge variant="secondary">Current</Badge>}
                </div>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4 w-full"
                  variant={isCurrent ? "outline" : plan.popular ? "primary" : "outline"}
                  disabled={isCurrent || !isStripeEnabled}
                >
                  {isCurrent ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
