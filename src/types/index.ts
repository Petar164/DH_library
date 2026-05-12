export type Role = 'pending' | 'viewer' | 'contributor' | 'admin'

export type FolderType = 'season' | 'celebrity' | 'magazine_scan' | 'promo' | 'piece'

export interface Folder {
  id: string
  name: string
  description: string | null
  type: FolderType
  cover_image_url: string | null
  created_by: string | null
  created_at: string
  creator?: Pick<Profile, 'username'>
  media_count?: number
}
export type Brand = 'dior_homme' | 'saint_laurent'
export type MediaType = 'image' | 'video' | 'interview' | 'scan'
export type Season = 'SS' | 'AW'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  text_color: string | null
  bg_color: string | null
  role: Role
  created_at: string
  updated_at: string
}

export interface SeasonRecord {
  id: string
  name: string
  brand: Brand
  year: number
  period: Season
  description: string | null
  cover_image_url: string | null
  created_by: string | null
  created_at: string
  media_count?: number
}

export interface Celebrity {
  id: string
  name: string
  bio: string | null
  cover_image_url: string | null
  created_by: string | null
  created_at: string
  media_count?: number
}

export interface Media {
  id: string
  title: string | null
  description: string | null
  type: MediaType
  file_url: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  season_id: string | null
  celebrity_id: string | null
  brand: Brand | null
  tags: string[] | null
  uploaded_by: string | null
  created_at: string
  season?: SeasonRecord
  celebrity?: Celebrity
  uploader?: Profile
}
