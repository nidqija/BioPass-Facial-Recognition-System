from .config.floci_config import s3

BUCKET_NAME = "my-app-bucket"

def remove_dummy_files_from_s3():
    # List all objects under the "faces/" directory in S3
    response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="faces/")

    objects_to_delete = []

    for obj in response.get("Contents", []):
        key = obj["Key"]

        # Filter out text files, dummy files, or specific non-image keys
        if key.endswith(".txt") or "dummy" in key.lower():
            objects_to_delete.append({"Key": key})
            print(f"Marked for deletion: {key}")

    # Delete the marked dummy objects in batch
    if objects_to_delete:
        s3.delete_objects(
            Bucket=BUCKET_NAME,
            Delete={"Objects": objects_to_delete}
        )
        print(f"\nSuccessfully deleted {len(objects_to_delete)} dummy file(s).")
    else:
        print("No dummy files found to delete.")

if __name__ == "__main__":
    remove_dummy_files_from_s3()