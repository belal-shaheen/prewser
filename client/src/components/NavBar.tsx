import { AppNavBar, setItemActive } from "baseui/app-nav-bar";
import { Block } from "baseui/block";
import { Button } from "baseui/button";
import {
  ALIGN,
  HeaderNavigation,
  StyledNavigationItem,
  StyledNavigationList,
} from "baseui/header-navigation";
import { StyledLink } from "baseui/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [mainItems, setMainItems] = useState([{ label: "Dashboard" }]);

  let body = null;
  if (!isServer() && !localStorage.getItem("token")) {
    //!data?.me
    body = (
      <>
        <HeaderNavigation>
          <StyledNavigationList $align={ALIGN.left}>
            <StyledNavigationItem>Survlow</StyledNavigationItem>
          </StyledNavigationList>
          <StyledNavigationList $align={ALIGN.center} />
          <StyledNavigationList $align={ALIGN.right}>
            <StyledNavigationItem>
              <StyledLink href="/login">Login</StyledLink>
            </StyledNavigationItem>
          </StyledNavigationList>
          <StyledNavigationList $align={ALIGN.right}>
            <StyledNavigationItem>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/register");
                }}
              >
                Get started
              </Button>
            </StyledNavigationItem>
          </StyledNavigationList>
        </HeaderNavigation>
      </>
    );
  } else {
    body = (
      <Block>
        <AppNavBar
          title="Survlow"
          mainItems={mainItems}
          onMainItemSelect={(item) => {
            setMainItems((prev) => setItemActive(prev, item));
            if (item.label == "Dashboard") {
              router.push("/dashboard");
            }
          }}
          username={
            !isServer()
              ? JSON.parse(localStorage.getItem("user") as string).firstName
              : ""
          }
          usernameSubtitle={
            !isServer()
              ? JSON.parse(localStorage.getItem("user") as string).email
              : ""
          }
          userItems={[{ label: "Settings" }, { label: "Logout" }]}
          onUserItemSelect={(item) => {
            if (item.label == "Logout") {
              localStorage.removeItem("token");
              router.push("/");
            }
          }}
        />
      </Block>
    );
  }

  return <Block margin="0">{body}</Block>;
};
