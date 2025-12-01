"use client";

import { ComponentConfig, createUsePuck, Puck, Config as PuckConfig, Data as PuckData, UiState as PuckUiState, AppState, Fields } from "@measured/puck";
import "@measured/puck/puck.css";

// Augment the type of puck to transit the state we want through the editor
type TAugmentedPuckUiState = PuckUiState & { advancedMode: boolean };
type TAugmentedPuckAppState = Pick<AppState, "data"> & { ui: TAugmentedPuckUiState };

// Components configs

type TTextBlockProps = {
  text: string;
  advancedText?: string;
};

const textBlockConfig: ComponentConfig<TTextBlockProps> = {
  resolveFields: (_, params) => {
    const uiState = params.appState.ui as TAugmentedPuckUiState;
    const fields: Fields<TTextBlockProps> = { text: { type: "text" } };

    console.log("resolveFields - textBlockConfig - advancedMode :", uiState.advancedMode);
    if (uiState.advancedMode) fields.advancedText = { type: "text" };

    return fields;
  },

  render: ({ text: someText }) => <h1>{someText}</h1>,
};

type TNumberBlockProps = {
  number: number;
  advancedNumber?: number;
};

const numberBlockConfig: ComponentConfig<TNumberBlockProps> = {
  resolveFields: (_, params) => {
    const uiState = params.appState.ui as TAugmentedPuckUiState;
    const fields: Fields<TNumberBlockProps> = { number: { type: "number" } };

    console.log("resolveFields - numberBlockConfig - advancedMode :", uiState.advancedMode);
    if (uiState.advancedMode) fields.advancedNumber = { type: "number" };

    return fields;
  },
  render: ({ number: theNumber }) => <p>The number is {theNumber}</p>,
};

// Global config

type TComponentsProps = {
  TextBlock: TTextBlockProps;
  NumberBlock: TNumberBlockProps;
};

const config = {
  components: {
    TextBlock: textBlockConfig,
    NumberBlock: numberBlockConfig,
  },
  root: {
    resolveFields: (data, params) => {
      const uiState = params.appState.ui as TAugmentedPuckUiState;
      console.log("resolveFields - rootConfig - advancedMode :", uiState.advancedMode);
      return {};
    },
  },
} as const satisfies PuckConfig<TComponentsProps>;
type TPuckConfig = typeof config;

// Initial data

type TData = PuckData<TComponentsProps>;
const initialData: TData = {
  root: { props: {} },
  zones: {},
  content: [
    {
      type: "TextBlock",
      props: {
        id: "id",
        text: "❤️",
      },
    },
  ],
};

const logData = (data: TData) => console.log(JSON.stringify(data, null, 2));
const usePuck = createUsePuck<TPuckConfig>();

export function PuckEditor() {
  return (
    <Puck
      config={config}
      data={initialData}
      onPublish={logData}
      overrides={{
        fields: ({ children }) => {
          const dispatch = usePuck(({ dispatch }) => dispatch);
          const puckState = usePuck(({ appState }) => appState) as TAugmentedPuckAppState;
          const selectedItem = usePuck(({ selectedItem }) => selectedItem);
          const getSelectorForId = usePuck(({ getSelectorForId }) => getSelectorForId);

          const advancedMode = puckState.ui.advancedMode ?? false;

          const nastyHack = () => {
            // Store the value of the state
            dispatch({
              type: "setUi",
              ui: { ...puckState.ui, advancedMode: !advancedMode } as TAugmentedPuckUiState,
            });

            if (selectedItem) {
              const selector = getSelectorForId(selectedItem.props.id);
              if (!selector) throw new Error("Selector not found");
              // Triggers resolvers of the selected component
              dispatch({
                type: "replace",
                destinationIndex: selector.index,
                destinationZone: selector.zone,
                data: { ...selectedItem },
              });
            } else {
              // Triggers resolvers of the root config
              dispatch({
                type: "replaceRoot",
                root: { ...puckState.data.root },
              });
            }
          };

          return (
            <>
              <button onClick={() => nastyHack()}>Set advanced mode to : {(!advancedMode).toString()}</button>
              <p>advancedMode : {advancedMode.toString()}</p>
              {children}
            </>
          );
        },
      }}
    />
  );
}
