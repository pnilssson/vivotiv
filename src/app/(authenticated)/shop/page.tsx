import PageTitle from "@/components/shared/page-title";
import Product from "./product";

const paymentOptions = [
  {
    title: "One week",
    description: "Get yourself one week worth of training.",
    priceId: "price_1QdeKSRpZn3h4qfLBhcmNKJY",
    price: "$1.99",
    weeklyPrice: "($1.99/week)",
    discount: "",
    className: "",
  },
  {
    title: "One weeks",
    description: "Get yourself four weeks worth of training.",
    priceId: "price_1QdeRCRpZn3h4qfLXsBBwv39",
    price: "$4.99",
    weeklyPrice: "($1.25/week)",
    discount: "37%",
    className: "",
  },
  {
    title: "Twelve weeks",
    description: "Get yourself twelve weeks worth of training.",
    priceId: "price_1QdeWmRpZn3h4qfLyWCG7f1A",
    price: "$11.99",
    weeklyPrice: "($0.99/week)",
    discount: "50%",
    className: "bg-violet-200",
  },
  {
    title: "26 weeks",
    description: "Get yourself 26 weeks worth of training.",
    priceId: "price_1QdeGXRpZn3h4qfLOk4KS5be",
    price: "$19.99",
    weeklyPrice: "($0.77/week)",
    discount: "61%",
    className: "",
  },
];

export default async function Page() {
  return (
    <>
      <PageTitle
        title={"Shop"}
        description={"All options are one time payments."}
      />
      <div className="flex flex-col gap-4">
        {paymentOptions.map((option, index) => (
          <Product
            key={index} // Use a unique key; index is used here as a fallback.
            title={option.title}
            description={option.description}
            priceId={option.priceId}
            price={option.price}
            weeklyPrice={option.weeklyPrice}
            discount={option.discount}
            className={option.className}
          />
        ))}
      </div>
    </>
  );
}
