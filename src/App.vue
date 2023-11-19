<template>
  <svg width="1060" height="800">
    <g class='graph' transform="translate(50, 50)">
    </g>
  </svg>
</template>

<script setup lang="ts">
import { stratify, pack, select, scaleOrdinal } from 'd3'
import { ref, onMounted, computed, watch } from 'vue';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const s = stratify()
  .id((d: any) => d.name)
  .parentId((d: any) => d.parent)

const p = pack()
  .size([960, 700])
  .padding(5)

const c = scaleOrdinal(['rgb(233,213,255)', 'rgb(168,85,247)', 'rgb(126,34,206)'])

const state = ref<BubbleWithId[]>([])
const rootNode = computed(() => s(state.value).sum((d: any) => d.amount))
const bubbleData = computed(() => p(rootNode.value).descendants())

watch(state, () => {
  const nodes = select('.graph').selectAll('g').data(bubbleData.value)

  nodes.enter().append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)
    .each(function(d) {
      select(this).append('circle')
        .attr('r', () => d.r)
        .attr('fill', () => c(d.depth.toString()))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)

      if (!d.children) {
        select(this).append('text')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('dy', '0.3rem')
          .attr('font-size', () => 10 + d.value * 2)
          .text(() => d.data.name)
      }
    })
})

function reducer(state: any, action: Action ) {
  switch (action.type) {
    case 'added':
      return [ ...state, action.payload ]
    case "modified":
      return state.map((d: BubbleWithId) => d.id === action.payload.id ? action.payload : d)
    case "removed":
      return state.filter((d: BubbleWithId) => d.id !== action.payload)
    default:
      throw new Error('Unknown type')
  }
}

function dispatch(action: Action) { state.value = reducer(state.value, action) }

onMounted(() => {
    onSnapshot(collection(db, "bubbles"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        switch (change.type) {
          case "added":
            const newitem = { ...change.doc.data(), id: change.doc.id };
            dispatch({ type: "added", payload: newitem });
            break;
          case "modified":
            const modifieditem = { ...change.doc.data(), id: change.doc.id };
            dispatch({ type: "modified", payload: modifieditem });
            break;
          case "removed":
            dispatch({ type: "removed", payload: change.doc.id });
            break;
          default:
            break;
        }
      });
    });

})
</script>
