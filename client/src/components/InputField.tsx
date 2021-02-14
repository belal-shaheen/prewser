import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";
// import {
//   Box,
//   FormLabel,
//   FormErrorMessage,
//   Textarea,
//   Input,
//   FormControl,
// } from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  textarea?: boolean;
  placeholder?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  size: _,
  placeholder,
  ...props
}) => {
  const [field, { error }] = useField(props);
  // let C = Input;
  // if (textarea) {
  //   C = Textarea;
  // }

  return (
    <FormControl label={() => label} error={() => error} caption={() => ""}>
      <Input placeholder={placeholder} />
    </FormControl>
  );

  // return (
  //   <FormControl isInvalid={!!error}>
  //     <FormLabel htmlFor={field.name}>{label}</FormLabel>
  //     <C {...field} {...props} id={field.name} />
  //     {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
  //   </FormControl>
  // );
};
