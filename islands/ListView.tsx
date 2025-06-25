import Button from '@/islands/Button.tsx';
import Iframely from '@/islands/Iframely.tsx';
import type { FeedList, FeedListItem } from '@/shared/api.ts';
import axios from 'axios-web';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

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
    let es = new EventSource(globalThis.location.href);

    es.addEventListener('message', (e) => {
      const newData: FeedList = JSON.parse(e.data);
      setData(newData);
      setDirty(false);
      setAdding(false);
    });

    es.addEventListener('error', async () => {
      es.close();
      const backoff = 10000 + Math.random() * 5000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      es = new EventSource(globalThis.location.href);
    });
  }, []);

  useEffect(() => {
    (async () => {
      while (!busy) {
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
                await axios.post(globalThis.location.href, chunk);
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
            1000,
          )
        );
      }
    })();
  }, []);

  const addTodoInput = useRef<HTMLInputElement>(null);
  const addTodo = useCallback(() => {
    const value = addTodoInput.current!.value;
    if (!value) return;
    addTodoInput.current!.value = '';

    const id = generateItemId();
    localMutations.current.set(id, {
      text: '',
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
    [],
  );

  return (
    <div class='w-full p-4'>
      <div class='flex'>
        <input
          class='w-full px-3 py-2 mr-4 border rounded'
          placeholder='Paste a link to post and expand'
          ref={addTodoInput}
        />
        <Button onClick={addTodo} disabled={adding}>
          Add
        </Button>
      </div>
      <div class='my-4'>
        <ol class='relative border-s border-gray-200 dark:border-gray-700'>
          {data.items.map((item) => (
            <ListItem
              key={item.id! + ':' + item.versionstamp!}
              item={item}
              save={saveTodo}
            />
          ))}
        </ol>
      </div>
      <div class='py-2 text-sm border-t border-gray-300 opacity-50'>
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
    input.current.value = item.text ?? '';
  }, []);
  const doDelete = useCallback(() => {
    const yes = confirm('Are you sure you want to delete this item?');
    if (!yes) return;
    setBusy(true);
    save(item, null, null);
  }, [item]);

  const postCreatedTimestamp = new globalThis.Date(item.createdAt!);
  const timestamp = `${postCreatedTimestamp.toLocaleDateString()} • ${postCreatedTimestamp.toLocaleTimeString()}`;

  return (
    <li class='mb-10 ms-4' {...{ 'data-item-id': item.id! }} key={item.id!}>
      {editing && (
        <>
          <input
            class='w-full px-3 py-2 mr-4 border rounded'
            ref={input}
            defaultValue={item.url}
          />
          <button
            class='ms-2'
            type='button'
            title='Save'
            onClick={doSave}
            disabled={busy}
          >
            💾
          </button>
          <button
            class='ms-2'
            type='button'
            title='Cancel'
            onClick={cancelEdit}
            disabled={busy}
          >
            🚫
          </button>
        </>
      )}
      {!editing && (
        <>
          <div class='absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700' />
          <time class='text-sm font-normal leading-none text-gray-400 dark:text-gray-500'>
            {timestamp}
          </time>
          <div class='mt-2' />
          <Iframely url={String(item.url || item.text)} />
          <Button onClick={doDelete} class='mt-4'>
            delete
          </Button>
        </>
      )}
    </li>
  );
}

function generateItemId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}
