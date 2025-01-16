import PageTitle from "@/components/shared/typography/page-title";
import Product from "./product";
import React from "react";

const paymentOptions = [
  {
    title: "26 weeks",
    description:
      "Enjoy 26 weeks of membership to access personalized training.",
    priceId: "price_1QdeGXRpZn3h4qfLOk4KS5be",
    price: "$19.99",
    weeklyPrice: "($0.77/week)",
    discount: "61%",
    highlight: false,
  },
  {
    title: "Twelve weeks",
    description:
      "Enjoy twelve weeks of membership to access personalized training.",
    priceId: "price_1QdeWmRpZn3h4qfLyWCG7f1A",
    price: "$11.99",
    weeklyPrice: "($0.99/week)",
    discount: "50%",
    highlight: true,
  },
  {
    title: "Four weeks",
    description:
      "Enjoy four weeks of membership to access personalized training.",
    priceId: "price_1QdeRCRpZn3h4qfLXsBBwv39",
    price: "$4.99",
    weeklyPrice: "($1.25/week)",
    discount: "37%",
    highlight: false,
  },
  {
    title: "One week",
    description:
      "Enjoy one week of membership to access personalized training.",
    priceId: "price_1QdeKSRpZn3h4qfLBhcmNKJY",
    price: "$1.99",
    weeklyPrice: "($1.99/week)",
    discount: "",
    highlight: false,
  },
];

export default async function Page() {
  return (
    <React.Fragment>
      <PageTitle
        title={"Shop"}
        description={"All options are one time payments."}
      />
      <div className="grid grid-col-1 md:grid-cols-2 gap-4">
        {paymentOptions.map((option, index) => (
          <Product
            key={index} // Use a unique key; index is used here as a fallback.
            title={option.title}
            description={option.description}
            priceId={option.priceId}
            price={option.price}
            weeklyPrice={option.weeklyPrice}
            discount={option.discount}
            highlight={option.highlight}
          />
        ))}
      </div>
    </React.Fragment>
  );
}
