# UI Components and Reusability

<cite>
**Referenced Files in This Document**   
- [ThemedText.tsx](file://mobile/components/ThemedText.tsx)
- [ThemedView.tsx](file://mobile/components/ThemedView.tsx)
- [ParallaxScrollView.tsx](file://mobile/components/ParallaxScrollView.tsx)
- [Collapsible.tsx](file://mobile/components/Collapsible.tsx)
- [HelloWave.tsx](file://mobile/components/HelloWave.tsx)
- [ui/IconSymbol.tsx](file://mobile/components/ui/IconSymbol.tsx)
- [ui/TabBarBackground.tsx](file://mobile/components/ui/TabBarBackground.tsx)
- [ui/TabBarBackground.ios.tsx](file://mobile/components/ui/TabBarBackground.ios.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Atomic Themed Components](#atomic-themed-components)
3. [Dynamic UI Components](#dynamic-ui-components)
4. [Cross-Platform UI Support Components](#cross-platform-ui-support-components)
5. [Component Composition Patterns](#component-composition-patterns)
6. [Best Practices and Performance](#best-practices-and-performance)

## Introduction
The xClone mobile application implements a modular and reusable component architecture to ensure visual consistency, reduce code duplication, and streamline development across platforms. The `components` directory houses a collection of UI components designed with atomic principles, where foundational elements like `ThemedText` and `ThemedView` serve as building blocks for higher-level components. This document details the design, implementation, and usage patterns of these components, emphasizing their role in maintaining a cohesive user interface across themes and devices.

## Atomic Themed Components

The foundation of the UI system lies in two atomic components: `ThemedText` and `ThemedView`. These components abstract theme-based styling logic, enabling consistent text and layout rendering across light and dark modes.

### ThemedText Component
`ThemedText` is a wrapper around React Native's `Text` component that supports dynamic theming and predefined typographic styles. It accepts optional `lightColor` and `darkColor` props to define text color based on the current theme, leveraging the `useThemeColor` hook for color resolution.

**Key Features:**
- **Theme-aware coloring**: Automatically selects color based on system theme.
- **Style variants**: Supports multiple text types including `default`, `title`, `subtitle`, `defaultSemiBold`, and `link`.
- **Extensible styling**: Accepts a `style` prop to override or extend default styles.

```tsx
<ThemedText type="title">Welcome to xClone</ThemedText>
```

This component ensures typographic consistency by centralizing font sizes, weights, and line heights in a single `StyleSheet`.

### ThemedView Component
`ThemedView` serves as a theme-aware container, analogous to `ThemedText` but for layout elements. It wraps React Native's `View` and supports background color theming via `lightColor` and `darkColor` props.

**Usage Example:**
```tsx
<ThemedView style={{ padding: 16 }}>
  <ThemedText>Content inside themed container</ThemedText>
</ThemedView>
```

By encapsulating theme logic in these base components, the application avoids repetitive conditional styling and promotes a clean, declarative syntax.

**Section sources**
- [ThemedText.tsx](file://mobile/components/ThemedText.tsx#L1-L60)
- [ThemedView.tsx](file://mobile/components/ThemedView.tsx#L1-L14)

## Dynamic UI Components

Higher-level components in the `components` directory implement dynamic behaviors and visual effects, enhancing user engagement through animation and interaction.

### ParallaxScrollView
`ParallaxScrollView` provides a visually rich scrolling experience with a parallax header effect. It uses `react-native-reanimated` to create smooth transformations on the header image as the user scrolls.

**Implementation Details:**
- **Header Animation**: The header scales and translates vertically based on scroll position using interpolation.
- **Theme Integration**: The header background color adapts to the current theme (`light` or `dark`).
- **Content Layout**: The content area is wrapped in a `ThemedView` with consistent padding and gap spacing.

```tsx
<ParallaxScrollView
  headerImage={<Image source={logo} />}
  headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
  <ThemedText>Scrollable content</ThemedText>
</ParallaxScrollView>
```

The component calculates scroll offset using `useScrollViewOffset` and applies animated styles to the header, creating a fluid, native-like effect.

### Collapsible
`Collapsible` is an interactive component that toggles the visibility of its children when the header is pressed. It features a rotating chevron icon that indicates the open/closed state.

**Behavior:**
- **State Management**: Uses `useState` to track open/closed status.
- **Visual Feedback**: Applies `activeOpacity` to the `TouchableOpacity` for touch feedback.
- **Icon Rotation**: The chevron rotates 90 degrees when expanded, animated via inline transform.

```tsx
<Collapsible title="Settings">
  <ThemedText>Hidden content</ThemedText>
</Collapsible>
```

This component promotes clean information hierarchy by allowing progressive disclosure of content.

### HelloWave
`HelloWave` demonstrates lightweight animation using `react-native-reanimated`. It animates a waving hand emoji (`👋`) through a sequence of rotational movements.

**Animation Logic:**
- **Shared Value**: `rotationAnimation` controls the rotation degree.
- **Animation Sequence**: Uses `withSequence` and `withRepeat` to create a wave-like motion (25° → 0°, repeated 4 times).
- **Performance**: Animation runs on the UI thread via `useAnimatedStyle`.

This component is typically used for onboarding or greeting screens to add personality.

**Section sources**
- [ParallaxScrollView.tsx](file://mobile/components/ParallaxScrollView.tsx#L1-L82)
- [Collapsible.tsx](file://mobile/components/Collapsible.tsx#L1-L45)
- [HelloWave.tsx](file://mobile/components/HelloWave.tsx#L1-L40)

## Cross-Platform UI Support Components

The `components/ui` directory contains platform-specific components that ensure visual fidelity across iOS, Android, and web.

### IconSymbol
`IconSymbol` provides a unified interface for icons across platforms:
- **iOS**: Uses SF Symbols via `expo-symbols`.
- **Android/Web**: Falls back to Material Icons via `@expo/vector-icons`.

**Mapping Strategy:**
A static `MAPPING` object translates SF Symbol names (e.g., `chevron.right`) to corresponding Material Icon names (`chevron-right`). This ensures consistent iconography despite platform differences.

```tsx
<IconSymbol name="chevron.right" size={18} color="#000" />
```

This abstraction shields developers from platform-specific icon libraries, promoting code portability.

### TabBarBackground
This component handles the tab bar background appearance differently per platform:
- **iOS**: Implements a translucent blur effect using `expo-blur` and `BlurView` with `tint="systemChromeMaterial"` for native integration.
- **Android/Web**: Uses a shim that returns `undefined`, resulting in an opaque background by default.

The `useBottomTabOverflow` hook returns the tab bar height on iOS (to account for safe area and blur), while returning `0` on other platforms.

**Section sources**
- [ui/IconSymbol.tsx](file://mobile/components/ui/IconSymbol.tsx#L1-L41)
- [ui/TabBarBackground.tsx](file://mobile/components/ui/TabBarBackground.tsx#L1-L6)
- [ui/TabBarBackground.ios.tsx](file://mobile/components/ui/TabBarBackground.ios.tsx#L1-L19)

## Component Composition Patterns

The component architecture emphasizes composition, type safety, and style inheritance.

### Prop Interfaces
Components use TypeScript interfaces to define clear contracts:
- `ThemedTextProps` extends `TextProps` and adds theme and type options.
- `PropsWithChildren` is used to ensure children are accepted where appropriate.

### Children Handling
Most container components (`Collapsible`, `ParallaxScrollView`, `ThemedView`) accept `children` as props, enabling flexible content nesting:
```tsx
<Collapsible title="Details">
  <ThemedText>Item 1</ThemedText>
  <ThemedText>Item 2</ThemedText>
</Collapsible>
```

### Style Inheritance
Styles are composed using array syntax in the `style` prop, allowing default styles to be extended:
```tsx
style={[{ color }, styles.default, style]}
```
This pattern ensures that custom styles passed via props take precedence.

**Section sources**
- [ThemedText.tsx](file://mobile/components/ThemedText.tsx#L7-L15)
- [Collapsible.tsx](file://mobile/components/Collapsible.tsx#L10-L12)
- [ParallaxScrollView.tsx](file://mobile/components/ParallaxScrollView.tsx#L18-L20)

## Best Practices and Performance

### Extending Components
To create new themed components, extend `ThemedView` or `ThemedText` and pass appropriate `lightColor` and `darkColor` values. For animated components, use `react-native-reanimated` APIs to ensure smooth 60fps performance.

### Customization
Avoid inline styles for reusable elements. Instead, define styles in `StyleSheet.create()` and expose variant props (like `type` in `ThemedText`).

### Performance Implications
- **Parallax Effects**: While visually appealing, parallax scrolling uses `Animated.ScrollView` and interpolation, which can impact performance on lower-end devices. Ensure header content is lightweight.
- **Animations**: `HelloWave` uses `withRepeat` and `withSequence`, which are efficient due to native driver support in `react-native-reanimated`.
- **Re-renders**: Components like `Collapsible` use `useState` for local state, minimizing unnecessary re-renders of parent components.

By adhering to these patterns, developers can maintain a high-performance, visually consistent UI across the xClone application.

**Section sources**
- [ParallaxScrollView.tsx](file://mobile/components/ParallaxScrollView.tsx#L25-L35)
- [HelloWave.tsx](file://mobile/components/HelloWave.tsx#L10-L20)
- [Collapsible.tsx](file://mobile/components/Collapsible.tsx#L8-L12)