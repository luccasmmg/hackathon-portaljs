import { promises as fs } from "fs";
import path from "path";
import { getProject } from "../lib/octokit";
import getConfig from "next/config";
import ExternalLinkIcon from "../components/icons/ExternalLinkIcon";
import TimeAgo from "react-timeago";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { MagnifyingGlassIcon, LinkIcon } from "@heroicons/react/20/solid";

export async function getStaticProps() {
  const jsonDirectory = path.join(process.cwd(), "/datasets.json");
  const repos = await fs.readFile(jsonDirectory, "utf8");
  const github_pat = getConfig().serverRuntimeConfig.github_pat;

  const projects = await Promise.all(
    JSON.parse(repos).map(async (repo) => {
      const project = await getProject(repo, github_pat);
      return { ...project, repo_config: repo };
    })
  );
  return {
    props: {
      projects,
    },
  };
}

export function Datasets({ projects }) {
  return (
    <>
      <NextSeo title="GitHub Datasets" />
      <div className="bg-gray-200 min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="py-8">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:mx-0">
                <p className="text-base font-semibold leading-7 text-indigo-600">
                  Get the data you need
                </p>
                <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Climate change data
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Data about climate change mainly CO2 Emissions
                </p>
              </div>
            </div>
          </div>
            <div className="mx-4 my-2 overflow-x-auto sm:mx-6 lg:mx-8">
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {projects.map((project) => (
                  <li
                    key={project.readme}
                    className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow"
                  >
                    <div className="flex w-full flex-1 items-start justify-between space-x-6 p-6">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <h3 className="truncate text-sm font-medium text-gray-900">
                            {project.name}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {project.repo_config.description}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <a
                            href={`/@${project.repo_config.owner}/${
                              project.repo_config.repo
                            }/${
                              project.base_path === "/" ? "" : project.base_path
                            }`}
                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                          >
                            <MagnifyingGlassIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                            Preview
                          </a>
                        </div>
                        <div className="-ml-px flex w-0 flex-1">
                          <a
                            href={project.html_url}
                            className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                          >
                            <LinkIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                            Repo
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
    </>
  );
}

export default Datasets;
