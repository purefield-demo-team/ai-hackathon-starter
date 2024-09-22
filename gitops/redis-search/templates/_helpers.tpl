{{/*
Expand the name of the chart.
*/}}
{{- define "redis-stack.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "redis-stack.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name (include "redis-stack.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "redis-stack.labels" -}}
helm.sh/chart: {{ include "redis-stack.chart" . }}
{{ include "redis-stack.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "redis-stack.selectorLabels" -}}
app: {{ include "redis-stack.name" . }}
release: {{ .Release.Name }}
{{- end -}}

{{/*
Chart label
*/}}
{{- define "redis-stack.chart" -}}
{{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}