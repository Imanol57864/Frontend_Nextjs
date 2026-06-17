export function Panel({ as: Tag = "section", className = "", children, ...props }) {
  return <Tag className={`panel ${className}`.trim()} {...props}>{children}</Tag>;
}

export function PanelToolbar({ columns = "panel-grid-3", className = "", children, ...props }) {
  return <div className={`panel-toolbar ${columns} ${className}`.trim()} {...props}>{children}</div>;
}

export function PanelBody({ className = "", children, ...props }) {
  return <div className={`panel-body ${className}`.trim()} {...props}>{children}</div>;
}
