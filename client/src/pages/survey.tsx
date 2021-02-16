import axios from "axios";
import { Block } from "baseui/block";
import { Button } from "baseui/button";
import { H1, Label1, Label2 } from "baseui/typography";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Survey: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    let config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
    if (typeof router.query.id === "string") {
      const response = async () => {
        const response = await axios
          .get(
            `https://survey-manager-v1.herokuapp.com/api/Surveys/Get?uid=${router.query.id}`
          )
          .catch((err) => console.error(err));
        console.log(response);
        if (!response) return;
        setName(response.data.title);
        setName(response.data.description);
      };
      response();
    }
  }, []);

  return (
    <Block
      marginTop="8%"
      width="60%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      margin="0 auto"
    >
      <Block text-align="center">
        <H1>{name}</H1>
        <Label1>{name}</Label1>
        <Block display="flex" justifyContent="space-around" marginTop="100px">
          <Button>Prev</Button>
          <Button>Next</Button>
        </Block>
      </Block>
    </Block>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Survey);
