import PageTitle from "@/components/shared/typography/page-title";
import Product from "./product";
import React from "react";
import { PROGRAM_GENERATION_LIMIT } from "@/lib/constants";

const MEMBERSHIP_OPTIONS = [
  {
    title: "26 weeks",
    description:
      "Enjoy 26 weeks of membership to access personalized training for as little as $0.77/week.",
    priceId: "price_1QdeGXRpZn3h4qfLOk4KS5be",
    price: "$19.99",
    discount: "61%",
    highlight: false,
  },
  {
    title: "Twelve weeks",
    description:
      "Enjoy twelve weeks of membership to access personalized training for as little as $0.99/week.",
    priceId: "price_1QdeWmRpZn3h4qfLyWCG7f1A",
    price: "$11.99",
    discount: "50%",
    highlight: true,
  },
  {
    title: "Four weeks",
    description:
      "Enjoy four weeks of membership to access personalized training for as little as $1.25/week.",
    priceId: "price_1QdeRCRpZn3h4qfLXsBBwv39",
    price: "$4.99",
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

const MEMBERSHIP_OPTIONS_LIVE = [
  {
    title: "26 weeks",
    description:
      "Enjoy 26 weeks of membership to access personalized training for as little as $0.77/week.",
    priceId: "price_1Qt2n7RpZn3h4qfL9LHjBapD",
    price: "$19.99",
    discount: "61%",
    highlight: false,
  },
  {
    title: "Twelve weeks",
    description:
      "Enjoy twelve weeks of membership to access personalized training for as little as $0.99/week.",
    priceId: "price_1Qt2mGRpZn3h4qfLiG30HoVP",
    price: "$11.99",
    discount: "50%",
    highlight: true,
  },
  {
    title: "Four weeks",
    description:
      "Enjoy four weeks of membership to access personalized training for as little as $1.25/week.",
    priceId: "price_1Qt2lXRpZn3h4qfLE9pJ7H39",
    price: "$4.99",
    discount: "37%",
    highlight: false,
  },
  {
    title: "One week",
    description:
      "Enjoy one week of membership to access personalized training.",
    priceId: "price_1Qt2jJRpZn3h4qfLymmeNNe8",
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
        className="mb-4 md:mb-8"
        title={"Membership store"}
        description={`All of the options below are one-time payments. With an active membership, you'll be able to generate up to ${PROGRAM_GENERATION_LIMIT} programs per week—for example, if you decide to adjust your configuration and create a new program. Please note that an active membership is required to view your generated programs.`}
      />
      <div className="grid grid-col-1 md:grid-cols-2 gap-4">
        {MEMBERSHIP_OPTIONS_LIVE.map((option, index) => (
          <Product
            key={index}
            title={option.title}
            description={option.description}
            priceId={option.priceId}
            price={option.price}
            discount={option.discount}
            highlight={option.highlight}
          />
        ))}
      </div>
    </React.Fragment>
  );
}
