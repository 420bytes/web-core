// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import { PremiumBadge } from "@/components/PremiumBadge.tsx";
import type { User } from "@/utils/db.ts";
import { fetchValues } from "@/utils/http.ts";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

const TH_STYLES = "p-4 text-left";
const TD_STYLES = "p-4";

function UserTableRow(props: User) {
  return (
    <tr class="border-b border-gray-200 hover:bg-gray-50 hover:dark:bg-gray-900">
      <td scope="col" class={TD_STYLES}>
        <GitHubAvatarImg login={props.login} size={32} />
        <a
          class="ml-4 align-middle hover:underline"
          href={"/users/" + props.login}
        >
          {props.login}
        </a>
      </td>
      <td scope="col" class={TD_STYLES + " text-gray-500"}>
        {props.isSubscribed ? (
          <>
            Premium <PremiumBadge class="inline w-5 h-5" />
          </>
        ) : (
          "Basic"
        )}
      </td>
      <td scope="col" class={TD_STYLES + " text-gray-500"}>
        ${(Math.random() * 100).toFixed(2)}
      </td>
    </tr>
  );
}

export interface UsersTableProps {
  /** Endpoint URL of the REST API to make the fetch request to */
  endpoint: string;
}

export default function UsersTable(props: UsersTableProps) {
  const usersSig = useSignal<User[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal(false);

  async function loadMoreUsers() {
    if (isLoadingSig.value) return;
    isLoadingSig.value = true;
    try {
      const { values, cursor } = await fetchValues<User>(
        props.endpoint,
        cursorSig.value
      );
      usersSig.value = [...usersSig.value, ...values];
      cursorSig.value = cursor;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to load users:", error.message);
      }
      console.error("Error loading users:", error);
      throw error;
    } finally {
      isLoadingSig.value = false;
    }
  }

  useEffect(() => {
    loadMoreUsers();
  }, []);

  return (
    <div class="w-full overflow-x-auto border-gray-300 rounded-lg shadow border-1">
      <table class="w-full border-collapse table-auto">
        <thead class="border-b border-gray-300">
          <tr>
            <th scope="col" class={TH_STYLES}>
              User
            </th>
            <th scope="col" class={TH_STYLES}>
              Subscription
            </th>
            <th scope="col" class={TH_STYLES}>
              Revenue
            </th>
          </tr>
        </thead>
        <tbody>
          {usersSig.value.map((user) => (
            <UserTableRow {...user} />
          ))}
        </tbody>
      </table>
      {cursorSig.value !== "" && (
        <button class="mt-4" type="button" onClick={loadMoreUsers}>
          {isLoadingSig.value ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
