import PageTitle from "@/components/shared/page-title";
import PaymentCard from "./payment-card";

const paymentOptions = [
  {
    title: "One week of training",
    priceId: "price_1QdeKSRpZn3h4qfLBhcmNKJY",
    price: "$1.99",
    weeklyPrice: "($1.99/week)",
  },
  {
    title: "Four weeks of training",
    priceId: "price_1QdeRCRpZn3h4qfLXsBBwv39",
    price: "$4.99",
    weeklyPrice: "($1.25/week)",
  },
  {
    title: "12 weeks of training",
    priceId: "price_1QdeWmRpZn3h4qfLyWCG7f1A",
    price: "$11.99",
    weeklyPrice: "($0.99/week)",
  },
  {
    title: "26 weeks of training",
    priceId: "price_1QdeGXRpZn3h4qfLOk4KS5be",
    price: "$19.99",
    weeklyPrice: "($0.77/week)",
  },
];

export default async function Page() {
  return (
    <>
      <PageTitle
        title={"Payment options"}
        description={"All options are one time payments."}
      />
      <div>
        <div className="grid gap-6 mx-auto mt-6 max-w-full grid-cols-2 xl:grid-cols-4">
          {paymentOptions.map((option, index) => (
            <PaymentCard
              key={index} // Use a unique key; index is used here as a fallback.
              title={option.title}
              priceId={option.priceId}
              price={option.price}
              weeklyPrice={option.weeklyPrice}
            />
          ))}
        </div>
      </div>
    </>
  );
}
