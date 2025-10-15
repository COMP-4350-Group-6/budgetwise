export interface CategoryProps {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon?: string;          // Emoji or icon identifier
  color?: string;         // Hex color for UI (#RRGGBB)
  isDefault: boolean;     // Was this a seeded default?
  isActive: boolean;      // Can be archived (soft delete)
  sortOrder: number;      // Display order
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  constructor(public readonly props: CategoryProps) {
    // Validation
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }
    if (props.name.length > 50) {
      throw new Error("Category name too long");
    }
    // Only allow letters A-Z (case insensitive) and spaces
    if (!/^[a-zA-Z\s]+$/.test(props.name)) {
      throw new Error("Category name can only contain letters A-Z and spaces");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }
}