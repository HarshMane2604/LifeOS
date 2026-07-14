
// Global CSS definition to fix TS2882
declare module '*.css' {
  const content: any;
  export default content;
}
declare module '@xyflow/react/dist/style.css';
