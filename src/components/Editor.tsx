"use client";

import { Config as PuckConfig, Puck } from "@measured/puck";
import "@measured/puck/puck.css";

// Create Puck component config
const config: PuckConfig = {
  components: {
    TestBlock: {
      fields: {
        test: {
          type: "custom",
          render: ({ value, onChange }) => {
            const onClickTest = () => onChange(new Date());
            console.log("rendering field with value:", value);

            return (
              <div style={{ color: "black" }}>
                <button onClick={onClickTest}>Click !</button>
                {!value && <p>No value</p>}
                {value && <div>Test value : {JSON.stringify(value)}</div>}
              </div>
            );
          },
        },
      },
      render: ({ children }) => {
        return <h1>{children}</h1>;
      },
    },
  },
};

// Describe the initial data
const initialData = {};

// Save the data to your database
const save = (data: any) => {
  console.log("data", data);
};

// Render Puck editor
export function PuckEditor() {
  return <Puck config={config} data={initialData} onPublish={save} />;
}
