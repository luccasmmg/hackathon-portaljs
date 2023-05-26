import Papa from 'papaparse';

export async function getCsv(url: string) {
  const response = await fetch(url);
  const data = await response.text();
  return data;
}

export async function parseCsv(file: string): Promise<any> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transform: (value: string): string => {
        return value.trim();
      },
      complete: (results: any) => {
        return resolve(results);
      },
      error: (error: any) => {
        return reject(error);
      },
    });
  });
}

import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { request, RequestDocument, Variables } from "graphql-request";
import getConfig from "next/config";
import useSWR from "swr";
import Plot from "react-plotly.js";

export default function LineChartPlotly({
  token,
  resourceName,
  schema,
}: {
  token?: string;
  resourceName: string;
  schema: any;
}) {
  const apiUri =
    getConfig().publicRuntimeConfig.DATA_API_URL +
    `/graphql?resource_id=${resourceName}&token=${token}`;
  const fetcher = (
    query: RequestDocument | TypedDocumentNode<any, Variables>
  ) => request(apiUri, query);
  const query = `
    query Dataset {
      ${resourceName}(order_by: {Date: asc}) {
       ${schema.fields.map((field) => field.name).join("\n")} 
      }
    }
`;
  const columnNames = schema.fields
    .map((field) => field.name)
    .filter((key) => key !== "Date");
  const { data, error } = useSWR(query, fetcher);
  if (!data) {
    return <span className="custom-container mx-8">Loading</span>;
  }
  if (error) {
    return <span>There was an error fetching the data</span>;
  }
  const trace = columnNames.map((columnName) => ({
    x: data[resourceName].map((item) => item["Date"].split("T")[0]),
    y: data[resourceName].map((item) => item[columnName]),
    mode: "markers+lines",
    type: "scatter",
    name: columnName,
  }));
  return (
    <Plot
      data={trace}
      useResizeHandler
      className="w-full h-[50vh]"
    />
  );
}
