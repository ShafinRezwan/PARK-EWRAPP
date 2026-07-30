import React from "react";
type ButtonProps = {
  buttonText: string;
  onButtonClick: () => void;
};

export default function CreateButton({
  buttonText,
  onButtonClick,
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onButtonClick}
      className="rounded-md bg-park-green px-10 py-3 transition-all duration-200 text-xl text-white cursor-pointer hover:bg-park-green-dark"
    >
      {buttonText}
    </button>
  );
}
