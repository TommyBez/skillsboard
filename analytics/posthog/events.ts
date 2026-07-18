import {
  ANALYTICS_EVENT_MANIFEST,
  ANALYTICS_SCHEMA_VERSION,
} from "./event-manifest.mjs"

export { ANALYTICS_SCHEMA_VERSION }

type AnalyticsEventManifest = typeof ANALYTICS_EVENT_MANIFEST
type PropertyDescriptor = "boolean" | "number" | "string" | readonly string[]

type InferPropertyDescriptor<Descriptor extends PropertyDescriptor> =
  Descriptor extends "boolean"
    ? boolean
    : Descriptor extends "number"
      ? number
      : Descriptor extends "string"
        ? string
        : Descriptor extends readonly (infer Value extends string)[]
          ? Value
          : never

export type AnalyticsEventName = keyof AnalyticsEventManifest

export type CapturableAnalyticsEventName = {
  [EventName in AnalyticsEventName]: AnalyticsEventManifest[EventName]["capture"] extends "custom"
    ? EventName
    : never
}[AnalyticsEventName]

export type TeamScopedAnalyticsEventName = {
  [EventName in AnalyticsEventName]: AnalyticsEventManifest[EventName]["teamScoped"] extends true
    ? EventName
    : never
}[AnalyticsEventName]

export type NonTeamScopedAnalyticsEventName = Exclude<
  AnalyticsEventName,
  TeamScopedAnalyticsEventName
>

export type TeamScopedCapturableAnalyticsEventName = Extract<
  CapturableAnalyticsEventName,
  TeamScopedAnalyticsEventName
>

export type NonTeamScopedCapturableAnalyticsEventName = Extract<
  CapturableAnalyticsEventName,
  NonTeamScopedAnalyticsEventName
>

export type AnalyticsEventProperties<EventName extends AnalyticsEventName> = {
  [PropertyName in keyof AnalyticsEventManifest[EventName]["properties"]]:
    AnalyticsEventManifest[EventName]["properties"][PropertyName] extends PropertyDescriptor
      ? InferPropertyDescriptor<AnalyticsEventManifest[EventName]["properties"][PropertyName]>
      : never
}

export type AnalyticsCapturedEventProperties<EventName extends AnalyticsEventName> =
  AnalyticsEventProperties<EventName> &
  (EventName extends TeamScopedAnalyticsEventName ? { team_id: string } : object)

export type AnalyticsCapturedEventPropertiesArgs<EventName extends AnalyticsEventName> =
  keyof AnalyticsCapturedEventProperties<EventName> extends never
    ? []
    : [properties: AnalyticsCapturedEventProperties<EventName>]

type AnalyticsEventPropertiesField<EventName extends AnalyticsEventName> =
  keyof AnalyticsEventProperties<EventName> extends never
    ? { properties?: never }
    : { properties: AnalyticsEventProperties<EventName> }

type AnalyticsCapturedEventPropertiesField<EventName extends AnalyticsEventName> =
  keyof AnalyticsCapturedEventProperties<EventName> extends never
    ? { properties?: never }
    : { properties: AnalyticsCapturedEventProperties<EventName> }

export type AnalyticsEventCapture<
  EventName extends CapturableAnalyticsEventName = CapturableAnalyticsEventName,
> = EventName extends CapturableAnalyticsEventName
  ? { event: EventName } & AnalyticsEventPropertiesField<EventName>
  : never

export type AnalyticsCapturedEventCapture<
  EventName extends CapturableAnalyticsEventName = CapturableAnalyticsEventName,
> = EventName extends CapturableAnalyticsEventName
  ? { event: EventName } & AnalyticsCapturedEventPropertiesField<EventName>
  : never
