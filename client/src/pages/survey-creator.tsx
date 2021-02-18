import { Block } from "baseui/block";
import { Breadcrumbs } from "baseui/breadcrumbs";
import { Button } from "baseui/button";
import { List } from "baseui/dnd-list";
import { FormControl } from "baseui/form-control";
import { ChevronDown, ChevronRight, Plus } from "baseui/icon";
import { Spinner } from "baseui/spinner";

import { Input, InputProps } from "baseui/input";
import { StyledLink } from "baseui/link";
import { NestedMenus, StatefulMenu } from "baseui/menu";
import { PLACEMENT, StatefulPopover } from "baseui/popover";
import { Tab, Tabs } from "baseui/tabs";
import {
  TreeLabel,
  TreeLabelProps,
  TreeNode,
  TreeView,
} from "baseui/tree-view";
import { Label2, Label3 } from "baseui/typography";
import { Select } from "baseui/select";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { NavBar } from "../components/NavBar";
import { Code } from "../components/survey_components/Code";
import { Email } from "../components/survey_components/Email";
import { LongText } from "../components/survey_components/LongText";
import { MultipleChoice } from "../components/survey_components/MutlipleChoice";
import { PlainText } from "../components/survey_components/PlainText";
import { ShortText } from "../components/survey_components/ShortText";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";
import axios from "axios";
import { counter } from "@fortawesome/fontawesome-svg-core";

const availableComps = [
  { label: "Code" },
  { label: "Email" },
  { label: "Long Text" },
  { label: "Short Text" },
  { label: "Multiple Choices" },
  { label: "Plain Text" },
];

const compsIds: any = {
  "Multiple Choices": 1,
  "Short Text": 2,
  "Long Text": 3,
  Code: 4,
  Statement: 5,
  Email: 6,
};

const idsComps: any = {
  "1": "Multiple Choices",
  "2": "Short Text",
  "3": "Long Text",
  "4": "Code",
  "5": "Statement",
  "6": "Email",
};

function move(
  arr: Array<string | undefined>,
  old_index: number,
  new_index: number
) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    var k = new_index - arr.length;
    while (k-- + 1) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
}

function remove(arr: Array<string | undefined>, index: number) {
  arr.splice(index, 1);
  return arr;
}

const CustomDragHandle = (props: any) => {
  useEffect(() => {}, []);

  let newob = JSON.parse(props.$value);
  let element = null;
  switch (newob.type) {
    case "Email":
      element = <Email label={newob.label} defaults={newob.default} />;
      break;
    case "Plain Text":
      element = <PlainText label={newob.label} />;
      break;
    case "Multiple Choices":
      element = <MultipleChoice label={newob.label} />;
      break;
    case "Short Text":
      element = <ShortText label={newob.label} />;
      break;
    case "Long Text":
      element = <LongText label={newob.label} />;
      break;
    case "Code":
      element = <Code />;
      break;
  }

  return <>{element}</>;
};

const CustomLabel = (node: TreeNode) => {
  const Tag = "label";

  const style = node.selected
    ? { textDecoration: "underline" }
    : { textDecoration: "none" };
  return (
    <Block $style={{ ...style }}>
      <Tag>{node.label}</Tag>
    </Block>
  );
};

const CustomTreeLabel = (props: TreeLabelProps) => {
  return (
    <TreeLabel
      {...props}
      label={CustomLabel}
      overrides={{
        CollapseIcon: {
          component: ChevronDown as any,
          props: {
            size: (5 - props.node.depth) * 10,
          },
        },
        ExpandIcon: {
          component: ChevronRight as any,
          props: {
            size: (5 - props.node.depth) * 10,
          },
        },
      }}
    />
  );
};

const SurveyCreator: React.FC<{}> = ({}) => {
  useIsAuth();
  const [surveyState, setSurveyState] = React.useState<any>([
    { name: "Page 0", components: [] },
  ]);
  const [currentPage, setCurrentPage] = React.useState<any>(0);
  const [currentElement, setCurrentElemenet] = React.useState<
    number | undefined
  >(undefined);
  const [activeKey, setActiveKey] = React.useState<any>("0");
  const [activeKey2, setActiveKey2] = React.useState<any>("0");
  const [selectValue, setSelectValue] = React.useState<any>([]);
  const [loading, setLoading] = useState(true);

  const [id, setid] = React.useState("");

  const privacyTypes = [
    { label: "Not shared", id: "0" },
    { label: "Public", id: "1" },
    { label: "Private", id: "2" },
  ];

  const [expandedState, setExpandedState] = useState<any>({ "0": false });
  const [selectedState, setSelectedState] = useState<any>({ "0": false });
  const router = useRouter();

  let query = router.asPath.split("?")[1];
  let survey = null;
  console.log(query);
  if (query !== undefined) {
    survey = query.substr(7);
  }

  const getData = () => {
    let config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
    if (typeof survey === "string") {
      const response = async () => {
        const response = await axios
          .get(
            `https://survey-manager-v1.herokuapp.com/api/Surveys/Get?uid=${
              JSON.parse(localStorage.getItem("user") as string).id
            }&email=${
              JSON.parse(localStorage.getItem("user") as string).email
            }&id=${survey}`,
            config
          )
          .catch((err) => console.error(err));

        if (!response) return;
        setLoading(false);

        if (response.data.share) {
          setLoading(false);
          setid(response.data.share.uniqueId);
        }

        console.log(response);
        const newState: any = [];
        let counter = 0;
        console.log(response);
        setSelectValue(privacyTypes[response.data.privacyType]);
        response.data.questions.forEach((question: any) => {
          if (counter > 20) {
            return;
          }
          counter += 1;
          if (newState[parseInt(question.pageNumber)] === undefined) {
            newState.push({
              name: `Page ${question.pageNumber}`,
              components: [],
            });
          }
          console.log("gg");
          newState[parseInt(question.pageNumber)].components.push(
            JSON.stringify({
              type: idsComps[`${question.typeId}`],
              label: question.title,
              default: "",
              extra: "",
              selected: false,
            })
          );
        });

        if (newState.length > 0) {
          console.log("bb");
          setSurveyState(newState);
        } else {
          return [{ name: "Page 0", components: [] }];
        }
      };
      response();
    } else {
      router.push("dashboard");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const deletePage = () => {
    // console.log(currentPage);
    // console.log(currentElement);
    if (surveyState.length === 1) {
      return;
    }
    const newState = [...surveyState];
    newState.splice(currentPage, 1);
    if (currentPage == 0) {
      setCurrentPage(0);
    } else {
      setCurrentPage(currentPage - 1);
    }
    setSurveyState(newState);
  };

  const mapState = (state: any) => {
    let newState = [];
    // { name: "page 0", components: [] },
    for (let i = 0; i < state.length; i++) {
      let newChildren = [];
      if (expandedState[`${i}`] == undefined) {
        const n: any = {};
        n[`${i}`] = false;
        setExpandedState({ ...expandedState, ...n });
      }

      if (selectedState[`${i}`] == undefined) {
        const n: any = {};
        n[`${i}`] = false;
        setSelectedState({ ...selectedState, ...n });
      }

      for (let j = 0; j < state[i].components.length; j++) {
        if (expandedState[`${i}-${j}`] == undefined) {
          const n: any = {};
          n[`${i}-${j}`] = false;
          setExpandedState({ ...expandedState, ...n });
        }

        if (selectedState[`${i}-${j}`] == undefined) {
          const n: any = {};
          n[`${i}-${j}`] = false;
          setSelectedState({ ...selectedState, ...n });
        }

        newChildren.push({
          id: `${i}-${j}`,
          label: `${JSON.parse(state[i].components[j]).label} (${
            JSON.parse(state[i].components[j]).type
          })`,
          isExpanded: expandedState[`${i}-${j}`],
          selected: selectedState[`${i}-${j}`],
        });
      }
      newState.push({
        id: `${i}`,
        label: state[i].name,
        children: newChildren,
        isExpanded: expandedState[`${i}`],
        selected: selectedState[`${i}`],
      });
    }

    return newState;
  };

  return (
    <Block>
      <NavBar />
      <Block
        position="fixed"
        left="0"
        marginLeft="0px"
        marginTop="0"
        width="240px"
        overflow-wrap="break-word"
        word-wrap="break-word"
        height="100%"
        overflow="scroll"
        overflow-y="scroll"
        overflow-x="hidden"
      >
        <StatefulPopover
          focusLock
          placement={PLACEMENT.bottomRight}
          content={({ close }) => (
            <NestedMenus>
              <StatefulMenu
                items={[{ label: "Add Page" }, { label: "Add component" }]}
                onItemSelect={async (item) => {
                  if (item.item.label === "Add Page") {
                    setSurveyState([
                      ...surveyState,
                      {
                        name: `Page ${parseInt(currentPage) + 1}`,
                        components: [],
                      },
                    ]);
                    setCurrentPage(currentPage + 1);
                  }
                }}
                overrides={{
                  List: {
                    style: { height: "72px", width: "138px", overflow: "auto" },
                  },
                  Option: {
                    props: {
                      getChildMenu: (item: { label: string }) => {
                        if (item.label === "Add component") {
                          return (
                            <StatefulMenu
                              items={availableComps}
                              onItemSelect={async (item) => {
                                await setSurveyState([
                                  ...surveyState.slice(0, currentPage),
                                  {
                                    ...surveyState[currentPage],
                                    components: [
                                      ...surveyState[currentPage].components,
                                      JSON.stringify({
                                        type: item.item.label,
                                        label: "Label",
                                        default: "",
                                        extra: "",
                                        selected: false,
                                      }),
                                    ],
                                  },
                                  ...surveyState.slice(currentPage + 1),
                                ]);
                              }}
                            />
                          );
                        }
                        return null;
                      },
                    },
                  },
                }}
              />
            </NestedMenus>
          )}
        >
          <Block>
            <Button
              $style={{ width: "calc(100%)" }}
              startEnhancer={() => <Plus size={24} />}
            >
              Add Element
            </Button>
          </Block>
        </StatefulPopover>
      </Block>

      <Block
        position="fixed"
        left="0"
        marginLeft="0px"
        marginTop="52px"
        width="240px"
        overflow-wrap="break-word"
        word-wrap="break-word"
        height="100%"
        overflow="scroll"
        overflow-y="scroll"
        overflow-x="hidden"
      >
        <Block>
          <Tabs
            onChange={({ activeKey }) => {
              setActiveKey(activeKey);
            }}
            activeKey={activeKey}
          >
            <Tab title="Hierarchy">
              {" "}
              <TreeView
                data={mapState(surveyState)}
                onToggle={async (node) => {
                  if ((node.label as string).includes("Page")) {
                    const n: any = {};
                    n[`${currentPage}`] = false;
                    n[`${currentPage}-${currentElement}`] = false;
                    n[`${node.id}`] = true;
                    setSelectedState({ ...selectedState, ...n });
                    setCurrentElemenet(undefined);
                    setCurrentPage(parseInt(node.id as string));
                  } else {
                    const n: any = {};
                    n[
                      `${(node.id as string).split("-")[0]}-${
                        (node.id as string).split("-")[1]
                      }`
                    ] = true;
                    n[`${(node.id as string).split("-")[0]}`] = true;
                    n[`${currentPage}`] = false;
                    n[`${currentPage}-${currentElement}`] = false;
                    setSelectedState({ ...selectedState, ...n });
                    setCurrentElemenet(
                      parseInt((node.id as string).split("-")[1])
                    );
                    setCurrentPage(parseInt((node.id as string).split("-")[0]));
                  }
                  const n: any = {};
                  n[`${node.id}`] = !expandedState[`${node.id}`];
                  setExpandedState({ ...expandedState, ...n });
                }}
                overrides={{
                  TreeLabel: CustomTreeLabel,
                }}
              />
            </Tab>
          </Tabs>
        </Block>
      </Block>

      <Block
        position="fixed"
        right="0"
        marginLeft="0px"
        width="240px"
        overflow-wrap="break-word"
        word-wrap="break-word"
        height="100%"
        overflow="scroll"
        overflow-y="scroll"
        overflow-x="hidden"
      >
        <Block>
          <Tabs
            onChange={({ activeKey }) => {
              setActiveKey2(activeKey);
            }}
            activeKey={activeKey2}
          >
            <Tab title="Properties">
              <Block>
                <Label2>Page:</Label2>

                <FormControl
                  label={() => "Page Name:"}
                  error={() => ""}
                  caption={() => ""}
                >
                  <Input
                    value={surveyState[currentPage].name}
                    onChange={(e) => {
                      setSurveyState([
                        ...surveyState.slice(0, currentPage),
                        {
                          ...surveyState[currentPage],
                          name: (e.target as InputProps).value,
                        },
                        ...surveyState.slice(currentPage + 1),
                      ]);
                    }}
                  />
                </FormControl>
                <StyledLink
                  style={{
                    color: "red",
                  }}
                  onClick={() => {
                    deletePage();
                  }}
                >
                  Delete Page
                </StyledLink>
                {currentElement != undefined && currentElement >= 0 ? (
                  <>
                    <Label2>Selected Component:</Label2>
                    <FormControl
                      label={() => "Label: "}
                      error={() => ""}
                      caption={() => ""}
                    >
                      <Input
                        value={
                          currentElement != undefined
                            ? JSON.parse(
                                surveyState[currentPage].components[
                                  currentElement
                                ]
                              ).label
                            : ""
                        }
                        onChange={(e) => {
                          if (currentElement === null || currentElement < 0) {
                            return;
                          }
                          let newElement = JSON.parse(
                            surveyState[currentPage].components[currentElement]
                          );
                          newElement.label = (e.target as InputProps).value;
                          setSurveyState([
                            ...surveyState.slice(0, currentPage),
                            {
                              ...surveyState[currentPage],
                              components: [
                                ...surveyState[currentPage].components.slice(
                                  0,
                                  currentElement
                                ),
                                JSON.stringify(newElement),
                                ...surveyState[currentPage].components.slice(
                                  (currentElement as number) + 1
                                ),
                              ],
                            },
                            ...surveyState.slice(currentPage + 1),
                          ]);
                        }}
                      />
                    </FormControl>
                    <FormControl
                      label={() => "Default: "}
                      error={() => ""}
                      caption={() => ""}
                    >
                      <Input
                        value={surveyState[currentPage].name}
                        onChange={(e) => {
                          setSurveyState([
                            ...surveyState.slice(0, currentPage),
                            {
                              ...surveyState[currentPage],
                              name: (e.target as InputProps).value,
                            },
                            ...surveyState.slice(currentPage + 1),
                          ]);
                        }}
                      />
                    </FormControl>
                  </>
                ) : null}
              </Block>
            </Tab>

            <Tab title="Sharing">
              <Block>
                <Label3 $style={{ marginBottom: "10px", marginTop: "10px" }}>
                  Select a privacy option...
                </Label3>
                <Select
                  options={privacyTypes}
                  value={selectValue}
                  onChange={async (params) => {
                    console.log(params.value);
                    setSelectValue(params.value);
                    let config = {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                      },
                    };
                    const link = `https://survey-manager-v1.herokuapp.com/api/Surveys/${survey}/Share`;
                    let type = 1;
                    if ((params.option as any).label == "Private") {
                      type = 2;
                    }
                    const response = await axios.post(
                      link,
                      { privacyType: type, emails: [] },
                      config
                    );
                    console.log(response);
                  }}
                />
                <StyledLink href={`http://localhost:3000/survey?id=${id}`}>
                  Survey
                </StyledLink>
              </Block>
            </Tab>
          </Tabs>
        </Block>
      </Block>

      {!loading ? (
        <Block>
          <Block
            marginTop="35px"
            width="70%"
            display="flex"
            justifyContent="center"
            margin="0 auto"
          >
            <Breadcrumbs>
              {surveyState.map((p: any, index: any) => {
                return index == currentPage ? (
                  <span>{p.name}</span>
                ) : (
                  <StyledLink
                    onClick={() => {
                      const n: any = {};
                      n[`${currentPage}`] = false;
                      n[`${currentPage}-${currentElement}`] = false;
                      n[`${index}`] = true;
                      setSelectedState({ ...selectedState, ...n });
                      setCurrentElemenet(undefined);
                      setCurrentPage(index);
                    }}
                    id={index}
                  >
                    {p.name}
                  </StyledLink>
                );
              })}
            </Breadcrumbs>
          </Block>
          <Block
            width="60%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            margin="0 auto"
          >
            <div style={{ overflow: "hidden" }}>
              <List
                items={surveyState[currentPage].components}
                removable
                removableByMove
                overrides={{
                  Label: {
                    component: CustomDragHandle,
                  },
                }}
                onChange={({ oldIndex, newIndex }) => {
                  if (currentElement == oldIndex) {
                    setCurrentElemenet(newIndex);
                  }

                  if (oldIndex === currentElement && newIndex === -1) {
                    const n: any = {};
                    n[`${currentPage}`] = false;
                    n[`${currentPage}-${currentElement}`] = false;
                    setSelectedState({ ...selectedState, ...n });
                    setCurrentElemenet(undefined);
                  }

                  if (
                    currentElement &&
                    oldIndex < currentElement &&
                    newIndex >= currentElement
                  ) {
                    const n: any = {};
                    n[`${currentPage}-${currentElement}`] = false;
                    n[`${currentPage}-${currentElement - 1}`] = true;
                    setSelectedState({ ...selectedState, ...n });
                    setCurrentElemenet(currentElement - 1);
                  }

                  if (
                    currentElement &&
                    oldIndex > currentElement &&
                    newIndex <= currentElement
                  ) {
                    const n: any = {};
                    n[`${currentPage}-${currentElement}`] = false;
                    n[`${currentPage}-${currentElement + 1}`] = true;
                    setSelectedState({ ...selectedState, ...n });
                    setCurrentElemenet(currentElement + 1);
                  }

                  const newState =
                    newIndex === -1
                      ? remove(surveyState[currentPage].components, oldIndex)
                      : move(
                          surveyState[currentPage].components,
                          oldIndex,
                          newIndex
                        );

                  setSurveyState([
                    ...surveyState.slice(0, currentPage),
                    {
                      ...surveyState[currentPage],
                      components: [...newState],
                    },
                    ...surveyState.slice(currentPage + 1),
                  ]);
                }}
              />
            </div>
          </Block>
        </Block>
      ) : (
        <Block display="flex" marginTop="17%" justifyContent="center">
          <Spinner size={96} />
        </Block>
      )}

      <Button
        $style={{
          position: "absolute",
          top: 0,
          right: 0,
          margin: "14px",
          marginRight: "30px",
        }}
        onClick={async () => {
          const questions = [];
          for (let i = 0; i < surveyState.length; i++) {
            for (let j = 0; j < surveyState[i].components.length; j++) {
              const { type, label, extra, selected } = JSON.parse(
                surveyState[i].components[j]
              );

              questions.push({
                typeId: compsIds[type],
                isMain: true,
                order: j,
                isActive: true,
                answerSchema: "extra",
                pageNumber: i,
                title: label,
              });
            }
          }
          const question = { questions: [...questions] };
          let config = {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          };
          const link = `https://survey-manager-v1.herokuapp.com/api/Surveys/${survey}/questions`;

          const response = await axios.post(link, { ...question }, config);
        }}
      >
        Save
      </Button>
    </Block>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(SurveyCreator);
