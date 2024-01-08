import { React } from "react";
import RiseLoader from "react-spinners/CircleLoader";

//css
const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "green",
};

function LoadingComponent() {
  return <RiseLoader color="blue" loading={true} cssOverride={override} />;
}

export default LoadingComponent;
