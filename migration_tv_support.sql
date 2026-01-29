-- Allow 'tv' in media_type check constraint for user_ratings
alter table user_ratings drop constraint user_ratings_media_type_check;
alter table user_ratings add constraint user_ratings_media_type_check check (media_type in ('movie', 'book', 'tv'));

-- Allow 'tv' in media_type check constraint for wishlist
alter table wishlist drop constraint wishlist_media_type_check;
alter table wishlist add constraint wishlist_media_type_check check (media_type in ('movie', 'book', 'tv'));
