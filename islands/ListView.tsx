import axios from "axios-web";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import IFramely from "@/islands/Iframely.tsx";
import type { FeedList, FeedListItem } from "@/shared/api.ts";

interface LocalMutation {
  text: string | null;
  url: string | null;
}

export default function ListView(props: {
  initialData: FeedList;
  latency: number;
}) {
  const [data, setData] = useState(props.initialData);
  const [dirty, setDirty] = useState(false);
  const localMutations = useRef(new Map<string, LocalMutation>());
  const [hasLocalMutations, setHasLocalMutations] = useState(false);
  const busy = hasLocalMutations || dirty;
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let es = new EventSource(window.location.href);

    es.addEventListener("message", (e) => {
      const newData: FeedList = JSON.parse(e.data);
      setData(newData);
      setDirty(false);
      setAdding(false);
    });

    es.addEventListener("error", async () => {
      es.close();
      const backoff = 10000 + Math.random() * 5000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      es = new EventSource(window.location.href);
    });
  }, []);

  useEffect(() => {
    (async () => {
      while (1) {
        const mutations = Array.from(localMutations.current);
        localMutations.current = new Map();
        setHasLocalMutations(false);

        if (mutations.length) {
          setDirty(true);
          const chunkSize = 10;
          for (let i = 0; i < mutations.length; i += chunkSize) {
            const chunk = mutations
              .slice(i, i + chunkSize)
              .map(([id, mut]) => ({
                id,
                text: mut.text,
                url: mut.url,
              }));
            while (true) {
              try {
                await axios.post(window.location.href, chunk);
                break;
              } catch {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }
        }

        await new Promise((resolve) =>
          setTimeout(
            () => requestAnimationFrame(resolve), // pause when the page is hidden
            1000
          )
        );
      }
    })();
  }, []);

  const addTodoInput = useRef<HTMLInputElement>(null);
  const addTodo = useCallback(() => {
    const value = addTodoInput.current!.value;
    if (!value) return;
    addTodoInput.current!.value = "";

    const id = generateItemId();
    localMutations.current.set(id, {
      text: "",
      url: value,
    });
    setHasLocalMutations(true);
    setAdding(true);
  }, []);

  const saveTodo = useCallback(
    (item: FeedListItem, text: string | null, url: string | null) => {
      localMutations.current.set(item.id!, {
        text,
        url,
      });
      setHasLocalMutations(true);
    },
    []
  );

  return (
    <div class="w-full">
      <div class="flex flex-col gap-4 pb-4">
        <div class="flex flex-row gap-2 items-center">
          <div
            class={`inline-block h-2 w-2 ${
              busy ? "bg-yellow-600" : "bg-primary"
            }`}
            style={{ borderRadius: "50%" }}
          ></div>
          <span class="opacity-50 text-sm">
            Share this page to collaborate with others.
          </span>
        </div>
        <div class="flex">
          <input
            class="border rounded w-full py-2 px-3 mr-4"
            placeholder="Paste a link to post and expand"
            ref={addTodoInput}
          />
          <div class="rounded-lg bg-gradient-to-tr from-secondary to-primary p-px">
            <button
              onClick={addTodo}
              disabled={adding}
              class="text-center text-white rounded-[7px] transition duration-300 px-4 py-2 block hover:bg-white hover:text-black hover:dark:bg-gray-900 hover:dark:!text-white"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <div class="my-4">
        {data.items.map((item) => (
          <ListItem
            key={item.id! + ":" + item.versionstamp!}
            item={item}
            save={saveTodo}
          />
        ))}
      </div>
      <div class="opacity-50 text-sm border-t border-gray-300 py-2">
        <p>Initial data fetched in {props.latency}ms</p>
      </div>
    </div>
  );
}

function ListItem({
  item,
  save,
}: {
  item: FeedListItem;
  save: (item: FeedListItem, text: string | null, url: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const doSave = useCallback(() => {
    if (!input.current) return;
    setBusy(true);
    save(item, null, input.current.value);
  }, [item]);
  const cancelEdit = useCallback(() => {
    if (!input.current) return;
    setEditing(false);
    input.current.value = item.text ?? "";
  }, []);
  const doDelete = useCallback(() => {
    const yes = confirm("Are you sure you want to delete this item?");
    if (!yes) return;
    setBusy(true);
    save(item, null, null);
  }, [item]);

  return (
    <div class="flex my-2 items-center" {...{ "data-item-id": item.id! }}>
      {editing && (
        <>
          <input
            class="border rounded w-full py-2 px-3 mr-4"
            ref={input}
            defaultValue={item.url}
          />
          <button
            class="p-2 rounded mr-2 disabled:opacity-50"
            title="Save"
            onClick={doSave}
            disabled={busy}
          >
            💾
          </button>
          <button
            class="p-2 rounded disabled:opacity-50"
            title="Cancel"
            onClick={cancelEdit}
            disabled={busy}
          >
            🚫
          </button>
        </>
      )}
      {!editing && (
        <>
          <div class="flex flex-col w-full font-mono">
            <IFramely url={String(item.url || item.text)} />
            <p class="text-xs opacity-50 leading-loose">
              {new Date(item.createdAt).toISOString()}
            </p>
          </div>
          <button
            class="p-2 disabled:opacity-50"
            title="Delete"
            onClick={doDelete}
            disabled={busy}
          >
            🗑️
          </button>
        </>
      )}
    </div>
  );
}

function generateItemId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}