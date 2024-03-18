import { useEffect } from "react";
import JSZip from "jszip";
import FileSaver from "file-saver";

// URLs to raw text flows in GitHub
const pwlessRegAuthnURL =
  "https://raw.githubusercontent.com/pingone-davinci/flows/main/Solutions/CIAMPasswordless/OOTB_Passwordless%20-%20Registration%2C%20Authentication%2C%20%26%20Account%20Recovery%20-%20Main%20Flow.json";
const deviceMgmtURL =
  "https://raw.githubusercontent.com/pingone-davinci/flows/main/Solutions/CIAMPasswordless/OOTB_Device%20Management%20-%20Main%20Flow.json";
const pwResetURL =
  "https://raw.githubusercontent.com/pingone-davinci/flows/main/Solutions/CIAMPasswordless/OOTB_Password%20Reset%20-%20Main%20Flow.json";
const profileMgmtURL =
  "https://raw.githubusercontent.com/pingone-davinci/flows/main/Solutions/CIAMPasswordless/OOTB_Basic%20Profile%20Management.json";

// Name of flows mapped to their respective URLs
const urls = {
  "OOTB_Passwordless - Registration, Authentication, & Account Recovery - Main Flow":
    pwlessRegAuthnURL,
  "OOTB_Device Management - Main Flow": deviceMgmtURL,
  "OOTB_Password Reset - Main Flow": pwResetURL,
  "OOTB_Basic Profile Management.json": profileMgmtURL,
};

export default function App({ debug }) {
  debug = false;

  // Automatically triggers download on initial render
  useEffect(() => {
    downloadFlowJSONFromGH();
  }, []);

  /**
   * The function `downloadFlowJSONFromGH` downloads flow JSON files from
   * GitHub, zips them up, and triggers the download of the zip file.
   */
  const downloadFlowJSONFromGH = async () => {
    try {
      // package to zip up the files
      const zip = new JSZip();
      // package to trigger the file download
      const saveAs = FileSaver.saveAs;

      const flows = await dlFlows({ debug });

      if (debug) {
        console.log("flows:", flows.toString());
      }

      if (!flows) {
        console.error("No go. No flows.");
      }

      const flowNames = Object.keys(flows);

      if (debug) {
        console.log("flowNames:", flowNames);
      }

      for (const name of flowNames) {
        const filename = name + ".json";

        const strFlowJSON = parseThenStringifyJSON({
          name,
          flows,
          debug,
        });

        if (debug) {
          console.log("zip filename:", filename);
          console.log("zip contents length:", strFlowJSON.length);
          console.log("zip contents:", strFlowJSON);
        }

        // add flow json file to zip
        zip.file(filename, strFlowJSON);
      }

      if (debug) {
        // count the number of flows that are in the zip
        let numFlowsZipped = 0;
        zip.forEach(() => numFlowsZipped++);

        console.log("number of flows zipped:", numFlowsZipped);
      }

      const zipName = "PasswordlessFlowPackForCustomers";
      // trigger download of zip file
      zip.generateAsync({ type: "blob" }).then(function (blob) {
        saveAs(blob, zipName + ".zip");
      });
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * The function `parseThenStringifyJSON` takes an object with properties `name`,
   * `flows`, and `debug`, parses a specific flow from `flows`, stringifies it,
   * and returns the result.
   *
   * @returns the stringified JSON representation of the `flows[name]` object with
   * an indentation of 2 spaces.
   */
  const parseThenStringifyJSON = ({ name, flows, debug }) => {
    try {
      if (debug) {
        console.log("parsing flow:", name);
        console.log(flows[name]);
      }

      const strFlowJSON = JSON.stringify(flows[name], null, 2);

      if (debug) {
        console.log("flow name:", name);
        console.log("stringified flow JSON:", strFlowJSON);
      }

      return strFlowJSON;
    } catch (error) {
      throw new Error("Failed to stringify flow json", {
        cause: error,
      });
    }
  };

  /**
   * The function `dlFlows` asynchronously downloads multiple JSON flows from
   * GitHub URLs and returns an object containing the flow JSON contents.
   *
   * @returns an object containing the downloaded flow JSON contents mapped to
   * their respective flow names.
   */
  const dlFlows = async ({ debug }) => {
    try {
      // Init object to Collect flow json contents
      const flowJSONs = {};

      // Wait for all flows to download
      const _flows = await Promise.all(
        Object.keys(urls).map(async (name, i, arr) => {
          try {
            if (debug) {
              console.log("urls:", arr.toString());
              console.log("fetching flow:", name);
              console.log("fetching from url:", urls[name]);
            }

            // Fetch flow json from GH and get body as json
            const res = await fetch(urls[name]);
            const flowJSON = await res.json();

            if (debug) {
              console.log("response body:", flowJSON);
            }

            // Add this flow json
            flowJSONs[name] = flowJSON;

            return flowJSON;
          } catch (err) {
            console.error(
              "Failed to download flow:",
              name,
              " --- from:",
              urls[name],
            );
          }
        }),
      );

      return flowJSONs;
    } catch (error) {
      // throw new Error("Downloading flow json files from GH failed", {
      //   cause: error,
      // });
      console.error("Downloading flow json files from GH failed:\n", error);
    }
  };

  return (
    <div className="mx-auto" style={{ maxWidth: "800px" }}>
      <div className="bg-light container-sm overflow-hidden text-center">
        <div className="row px-5 pt-4 gy-2 justify-content-center align-items-center">
          <div className="d-flex col-12 justify-content-center align-items-center">
            <img
              className="align-self-center"
              src="https://assets.pingone.com/ux/ui-library/5.0.2/images/logo-pingidentity.png"
              alt="Ping Identity"
              style={{ height: "65px", width: "65px" }}
            />
          </div>

          <div className="d-flex col-12 justify-content-center align-items-center">
            <h1 className="text-center fs-1">CIAM Passwordless Flow Pack</h1>
          </div>

          <div className="col-12 d-flex px-5 pb-5 justify-content-center align-items-center text-start">
            <a
              id="goToDocsLink"
              name="goToDocsLink"
              data-id="goToDocsLink"
              className="text-start text-muted"
              href="https://docs.pingidentity.com/r/en-us/pingone_for_customers_passwordless/ciam_passwordless_configuring_flows_in_davinci"
            >
              After downloading, visit the documentation to get started.
            </a>
          </div>
          <div className="d-flex col-12 justify-content-center align-items-center">
            <div className="row w-100 gx-3 justify-content-around align-items-center">
              <div className="d-flex col-3 flex-shrink-1 flex-grow-0 justify-content-start align-items-center">
                <button
                  id="dlFlowsBtn"
                  name="dlFlowsBtn"
                  data-id="dlFlowsBtn"
                  className="btn btn-primary mb-3"
                  onClick={() => downloadFlowJSONFromGH()}
                  type="button"
                  autoFocus
                >
                  Download
                </button>
              </div>

              <div className="d-flex col-3 flex-shrink-1 flex-grow-0 justify-content-center align-items-center">
                {/* Redirects to Integration Marketplace using formAction */}
                <button
                  id="backToMarketplaceBtn"
                  name="backToMarketplaceBtn"
                  data-id="backToMarketplaceBtn"
                  method="get"
                  onClick={() => {
                    window.location =
                      "https://support.pingidentity.com/s/marketplace-integration/a7iDo0000010xwlIAA/passwordless-flow-pack-customer-identities";
                  }}
                  type="button"
                  className="btn btn-secondary mb-3 text-nowrap"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
