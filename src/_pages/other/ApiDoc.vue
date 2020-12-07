<template>
  <div id="swagger-ui"></div>
</template>

<style lang="scss">
.opblock-post {
  border-color: #fca130 !important;
  background: rgba(#fca130, 0.1) !important;

  .opblock-summary-method {
    background: #fca130 !important;
  }

  .opblock-summary {
    border-color: #fca130 !important;
  }

  .tab-header .tab-item.active h4 span:after {
    background: #fca130 !important;
  }
}

.opblock-put {
  border-color: #49cc90 !important;
  background: rgba(#49cc90, 0.1) !important;

  .opblock-summary-method {
    background: #49cc90 !important;
  }

  .opblock-summary {
    border-color: #49cc90 !important;
  }

  .tab-header .tab-item.active h4 span:after {
    background: #49cc90 !important;
  }
}
</style>

<script>
import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

export default {
  mounted() {
    SwaggerUI({
      url: '/api/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      apisSorter: 'alpha',
      tagsSorter: 'alpha',
    });
  },
};
</script>
